from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from .models import Film, Musica, Voto, ApiKeys
from unittest.mock import patch, MagicMock
import json

class ModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')

    @patch('catalogo.models.cerca_film_tmdb')
    def test_film_save_tmdb(self, mock_tmdb):
        # Mocking external API
        mock_tmdb.return_value = {
            'titolo': 'Mocked Movie',
            'anno': 2023,
            'descrizione': 'A mocked description',
            'poster': '/mocked_poster.jpg'
        }

        film = Film(imdb_tmdb_id='tmdb:12345')
        film.save()

        self.assertEqual(film.titolo, 'Mocked Movie')
        self.assertEqual(film.anno_uscita, 2023)
        self.assertEqual(film.trama, 'A mocked description')
        self.assertTrue('image.tmdb.org' in film.poster)

    @patch('catalogo.models.cerca_film_imdb')
    def test_film_save_imdb(self, mock_imdb):
        # Mocking external API
        mock_imdb.return_value = {
            'titolo': 'Mocked IMDB Movie',
            'anno': 2022,
            'descrizione': 'IMDB description',
            'poster': '/imdb_poster.jpg'
        }

        film = Film(imdb_tmdb_id='imdb:tt1234567')
        film.save()

        self.assertEqual(film.titolo, 'Mocked IMDB Movie')

    def test_film_save_no_api(self):
        film = Film.objects.create(titolo="Manual Movie", anno_uscita=2000)
        self.assertEqual(film.titolo, "Manual Movie")
        self.assertEqual(film.anno_uscita, 2000)

    @patch('spotipy.Spotify')
    @patch('spotipy.oauth2.SpotifyClientCredentials')
    def test_musica_save_spotify(self, mock_creds, mock_spotify_cls):
        # Setup mock
        mock_instance = MagicMock()
        mock_spotify_cls.return_value = mock_instance

        # Mock album data return
        mock_instance.album.return_value = {
            'name': 'Mock Album',
            'artists': [{'name': 'Mock Artist'}],
            'release_date': '2021-01-01',
            'images': [{'url': 'http://image.url'}],
            'tracks': {'items': [{'name': 'Track 1'}, {'name': 'Track 2'}]}
        }

        musica = Musica(spotify_url='https://open.spotify.com/album/4LH4d3cOWNNsVw41Gqt2kv?si=...')
        musica.save()

        self.assertEqual(musica.titolo, 'Mock Album')
        self.assertEqual(musica.artista, 'Mock Artist')
        self.assertEqual(musica.anno_uscita, 2021)
        self.assertIn('Track 1', musica.descrizione)

    def test_voto_constraints(self):
        film = Film.objects.create(titolo="Test Film")
        Voto.objects.create(utente=self.user, film=film, valore=8)

        # Try to vote again for same film
        with self.assertRaises(Exception): # IntegrityError ideally, but Exception covers it
            Voto.objects.create(utente=self.user, film=film, valore=9)

    def test_api_key_generation(self):
        key = ApiKeys.objects.create(user=self.user, nome="Test Key")
        self.assertTrue(key.key) # Should be auto-generated
        self.assertEqual(len(key.key), 43) # secrets.token_urlsafe(32) is approx 43 chars

class ViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='password')
        self.film = Film.objects.create(titolo="Test Film", media_type="dvd")
        self.musica = Musica.objects.create(titolo="Test Album", artista="Artist", media_type="cd")

    def test_homepage_movies(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Test Film")
        # Should not contain music by default/context logic if purely separate,
        # but template renders both usually hidden by CSS/JS or context flag.
        # Checking context:
        self.assertTrue(response.context['views']['movies'])
        self.assertFalse(response.context['views']['music'])

    def test_homepage_music(self):
        response = self.client.get(reverse('music'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.context['views']['music'])
        self.assertFalse(response.context['views']['movies'])

    def test_profilo_login_required(self):
        response = self.client.get(reverse('profilo'))
        self.assertNotEqual(response.status_code, 200) # Should redirect

        self.client.login(username='testuser', password='password')
        response = self.client.get(reverse('profilo'))
        self.assertEqual(response.status_code, 200)

    def test_salva_voto(self):
        self.client.login(username='testuser', password='password')

        # Test creating vote
        response = self.client.post(reverse('salva_voto'), {
            'tipo': 'film',
            'id_oggetto': self.film.id,
            'valore': 9
        })
        self.assertEqual(Voto.objects.filter(utente=self.user, film=self.film).first().valore, 9)

        # Test updating vote
        response = self.client.post(reverse('salva_voto'), {
            'tipo': 'film',
            'id_oggetto': self.film.id,
            'valore': 5
        })
        self.assertEqual(Voto.objects.filter(utente=self.user, film=self.film).first().valore, 5)

        # Test deleting vote
        response = self.client.post(reverse('salva_voto'), {
            'tipo': 'film',
            'id_oggetto': self.film.id,
            'valore': 0
        })
        self.assertFalse(Voto.objects.filter(utente=self.user, film=self.film).exists())

    def test_api_add_element(self):
        # Create API Key
        staff_user = User.objects.create_user(username='staff', password='password', is_staff=True)
        api_key_obj = ApiKeys.objects.create(user=staff_user, nome="Staff Key")
        api_key = api_key_obj.key

        # Test valid request
        data = {
            'tipo': 'film',
            'id_riferimento': 'tmdb:999',
            'posizione': 'Scaffale A'
        }

        # Mocking utils within views? No, save logic is in models.
        # But we need to mock model save logic again or it will try to fetch TMDB
        with patch('catalogo.models.cerca_film_tmdb') as mock_tmdb:
            mock_tmdb.return_value = {'titolo': 'API Movie', 'anno': 2024, 'descrizione': '...', 'poster': ''}

            response = self.client.post(
                reverse('api_aggiungi'),
                data=json.dumps(data),
                content_type='application/json',
                HTTP_X_API_KEY=api_key
            )

            self.assertEqual(response.status_code, 200)
            self.assertTrue(Film.objects.filter(titolo='API Movie').exists())

            # Check usage counter
            api_key_obj.refresh_from_db()
            self.assertEqual(api_key_obj.utilizzi, 1)

    def test_api_invalid_key(self):
        response = self.client.post(
            reverse('api_aggiungi'),
            data=json.dumps({'tipo': 'film'}),
            content_type='application/json',
            HTTP_X_API_KEY='wrongkey'
        )
        self.assertEqual(response.status_code, 403)
