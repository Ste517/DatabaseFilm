from django.db import models
from django.contrib.auth.models import User  # Ci servirà per i voti
from .utils import cerca_film_tmdb,cerca_film_imdb
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from django.conf import settings
import os
import secrets

MEDIA_CHOICES = [

    ('Audio', [

        ('vinyl', 'Vinile'),
        ('cass', 'Cassetta'),
        ('cd', 'CD'),
        ('unknown', 'Unknown'),

    ]),

    ('Video', [

        ('vhs', 'VHS'),
        ('bray', 'Blu-ray'),
        ('dvd', 'DVD'),
        ('unknown', 'Unknown'),

    ]),
]

class Film(models.Model):
    titolo = models.CharField(max_length=200, blank=True)
    anno_uscita = models.IntegerField(null=True, blank=True)
    posizione_fisica = models.CharField(max_length=100, help_text="Dove si trova la copia fisica?", default="Libreria")
    imdb_tmdb_id = models.CharField(max_length=50, blank=True, null=True, verbose_name="ID IMDB/TMDB")
    
    trama = models.TextField(blank=True, null=True)
    poster = models.URLField(blank=True, null=True, verbose_name="URL Poster")

    media_type = models.CharField(
        max_length=10,
        choices=MEDIA_CHOICES[1][1],
        default='unknown'
    )

    def __str__(self):
        return self.titolo
    
    def save(self, *args, **kwargs):
        # Se c'è un ID di TMDB ma non abbiamo ancora la trama...
        if self.imdb_tmdb_id and not self.trama:
            print(f"🔄 Sto scaricando i dati per: {self.titolo}...")
            if self.imdb_tmdb_id.startswith("tmdb:"):
                dati_tmdb = cerca_film_tmdb(self.imdb_tmdb_id[5:])
            elif self.imdb_tmdb_id.startswith("imdb:"):
                dati_tmdb = cerca_film_imdb(self.imdb_tmdb_id[5:])
            else:
                dati_tmdb = None
            
            if dati_tmdb:
                self.titolo = dati_tmdb['titolo']
                self.anno_uscita = dati_tmdb['anno']
                self.trama = dati_tmdb['descrizione']
                # Costruiamo l'URL completo dell'immagine
                if dati_tmdb['poster']:
                    self.poster = f"https://image.tmdb.org/t/p/w500{dati_tmdb['poster']}"
        
        # Alla fine, salviamo davvero nel database
        super().save(*args, **kwargs)

class Musica(models.Model):
    titolo = models.CharField(max_length=100, blank=True) # Blank perché lo può trovare Spotify
    anno_uscita = models.IntegerField(null=True, blank=True)
    artista = models.CharField(max_length=100, blank=True)
    posizione_fisica = models.CharField(max_length=100, help_text="Dove si trova la copia fisica?", default="Libreria")
    
    # Questo è il campo chiave: incolli qui il link e lui fa il resto
    spotify_url = models.URLField(blank=True, null=True, help_text="Incolla qui il link dell'album da Spotify")
    
    copertina = models.URLField(blank=True, null=True)
    descrizione = models.TextField(blank=True, null=True)
    
    media_type = models.CharField(
        max_length=10,
        choices=MEDIA_CHOICES[0][1],
        default='unknown'
    )

    def __str__(self):
        return f"{self.titolo} - {self.artista}"

    # AUTOMAZIONE SPOTIFY
    def save(self, *args, **kwargs):
        # Se c'è un link Spotify e mancano i dati, scarichiamoli!
        if self.spotify_url and (not self.titolo or not self.copertina):
            try:
                # 1. Configurazione Autenticazione (legge dal file .env)
                client_credentials_manager = SpotifyClientCredentials(
                    client_id=os.getenv('SPOTIPY_CLIENT_ID'),
                    client_secret=os.getenv('SPOTIPY_CLIENT_SECRET')
                )
                sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

                # 2. Pulizia URL per ottenere solo l'ID dell'album
                # Esempio: https://open.spotify.com/album/4LH4d3cOWNNsVw41Gqt2kv?si=...
                # Prende solo "4LH4d3cOWNNsVw41Gqt2kv"
                album_id = self.spotify_url.split("/album/")[1].split("?")[0]

                # 3. Chiamata API a Spotify
                album_data = sp.album(album_id)
                
                if album_data:
                    # 4. Salvataggio Dati
                    self.titolo = album_data['name']
                    # Prende il primo artista della lista
                    self.artista = album_data['artists'][0]['name']
                    
                    release_date = album_data.get('release_date', '')
                    if release_date:
                        self.anno_uscita = int(release_date[:4])

                    # Prende l'immagine più grande (la prima della lista)
                    if album_data['images']:
                        self.copertina = album_data['images'][0]['url']

                    # 5. Creazione Tracklist per la descrizione
                    tracks = album_data['tracks']['items']
                    tracklist_text = "Tracce:\n"
                    for i, track in enumerate(tracks, 1):
                        tracklist_text += f"{i}. {track['name']}\n"

                    self.descrizione = tracklist_text
                else:
                    raise Exception("API call returned None object")

            except Exception as e:
                print(f"Errore Spotify: {e}")
                # Se fallisce, salva comunque quello che hai inserito a mano
        
        super().save(*args, **kwargs)

class Voto(models.Model):
    # Chi ha votato
    utente = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Cosa ha votato (può essere Film O Musica)
    film = models.ForeignKey('Film', on_delete=models.CASCADE, null=True, blank=True, related_name="voti")
    musica = models.ForeignKey('Musica', on_delete=models.CASCADE, null=True, blank=True, related_name="voti")
    
    # Il voto (da 1 a 10, o 1 a 5)
    valore = models.IntegerField()

    class Meta:
        # Vincolo: Un utente può votare UN solo film specifico (o disco)
        # Se vota di nuovo, aggiorniamo questo record invece di crearne uno nuovo
        constraints = [
            models.UniqueConstraint(fields=['utente', 'film'], name='voto_unico_film'),
            models.UniqueConstraint(fields=['utente', 'musica'], name='voto_unico_musica')
        ]

    def __str__(self):
        return f"{self.utente.username} -> {self.valore}"

class ApiKeys(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    key = models.CharField(max_length=100, unique=True, blank=True, help_text="Lascia vuoto per generare automaticamente")
    utilizzi = models.PositiveIntegerField(default=0, verbose_name="Numero Utilizzi")
    nome = models.CharField(max_length=50, help_text="Nome identificativo (es. 'Script Python', 'App Mobile')", default="Default")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "API Key"
        verbose_name_plural = "API Keys"

    def save(self, *args, **kwargs):
        # Se la chiave non esiste, ne generiamo una casuale sicura url-safe a 32 byte
        if not self.key:
            self.key = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nome} ({self.user.username})"