import requests
import os

def cerca_film_tmdb(tmdb_id):
    """
    Riceve un ID di TMDB, contatta l'API e restituisce i dati del film.
    """
    api_key = os.getenv('TMDB_API_KEY')
    if not api_key:
        print("Errore: API Key non trovata!")
        return None

    # Costruiamo l'indirizzo esatto per chiedere i dati (in italiano)
    url = f"https://api.themoviedb.org/3/movie/{tmdb_id}?api_key={api_key}&language=it-IT"
    
    response = requests.get(url)
    
    # Se il server risponde con successo (codice 200)
    if response.status_code == 200:
        dati = response.json()
        return {
            'titolo': dati.get('title'),
            'anno': dati.get('release_date', '')[:4], # Prendiamo solo i primi 4 caratteri (l'anno)
            'poster': dati.get('poster_path'), # Questo è solo il pezzo finale dell'URL dell'immagine
            'descrizione': dati.get('overview')
        }
    else:
        return None
    
def cerca_film_imdb(imdb_id):
    """
    Riceve un ID di IMDB, contatta l'API e restituisce i dati del film.
    """
    api_key = os.getenv('TMDB_API_KEY')
    if not api_key:
        print("Errore: API Key non trovata!")
        return None

    # Costruiamo l'indirizzo esatto per chiedere i dati (in italiano)
    url = f"https://api.themoviedb.org/3/find/{imdb_id}?api_key={api_key}&language=it-IT&external_source=imdb_id"
    
    response = requests.get(url)
    
    # Se il server risponde con successo (codice 200)
    if response.status_code == 200:
        dati = response.json()
        if len(dati.get('movie_results')) > 0:
            return cerca_film_tmdb(dati.get("movie_results")[0].get("id"))
    else:
        return None

def cerca_catalogo_netflix(n_pagine = 10, sort_type = '-id'):
    """
    Cerca su TMDB i film attualmente disponibili su Netflix Italia.
    """

    mappa_ordinamento = {
        'titolo': 'original_title.asc',       # Alfabetico (A-Z)
        '-titolo': 'original_title.desc',     # Alfabetico (Z-A)
        '-media': 'vote_average.desc',        # Voto (Migliori)
        'media': 'vote_average.asc',          # Voto (Peggiori)
        '-id': 'primary_release_date.desc',   # Aggiunti di recente (usiamo la data di uscita come "novità")
        'id': 'primary_release_date.asc',     # Meno recenti
        'media_type': 'popularity.desc',      
        'posizione_fisica': 'popularity.desc',
    }

    api_key = os.getenv('TMDB_API_KEY')
    # Provider ID 8 = Netflix, Region IT = Italia
    url = f"https://api.themoviedb.org/3/discover/movie?api_key={api_key}&with_watch_providers=8&watch_region=IT&language=it-IT&sort_by={mappa_ordinamento.get(sort_type)}&page="
    
    risultati = []
    for i in range(1,n_pagine+1):
        response = requests.get(url+str(i))
    
        if response.status_code == 200:
            dati = response.json()
            for item in dati.get('results', []):
                # Creiamo un oggetto "finto" simile al modello Film per il template
                film_finto = {
                    'id': item['id'], # ID di TMDB
                    'titolo': item['title'],
                    'anno_uscita': item['release_date'][:4] if item.get('release_date') else 'N/D',
                    'poster': f"https://image.tmdb.org/t/p/w500{item['poster_path']}" if item.get('poster_path') else None,
                    'trama': item['overview'],
                    'posizione_fisica': 'Streaming (Netflix)',
                    'media': item.get('vote_average', 0),
                    'is_virtual': True # Flag per dire al template che non è nel DB
                }
                risultati.append(film_finto)
            
    return risultati