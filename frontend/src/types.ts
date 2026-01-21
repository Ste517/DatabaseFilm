export interface Film {
  id: number;
  titolo: string;
  anno_uscita: number | null;
  posizione_fisica: string;
  imdb_tmdb_id: string | null;
  trama: string | null;
  poster: string | null;
  media_type: string;
  media_rating: number | null;
}

export interface Musica {
  id: number;
  titolo: string;
  anno_uscita: number | null;
  artista: string;
  posizione_fisica: string;
  spotify_url: string | null;
  copertina: string | null;
  descrizione: string | null;
  media_type: string;
  media_rating: number | null;
}

export interface Voto {
  id: number;
  utente: number;
  film: number | null;
  musica: number | null;
  valore: number;
}
