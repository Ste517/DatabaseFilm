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