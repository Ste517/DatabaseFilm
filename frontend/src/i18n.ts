import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Movies": "Movies",
      "Music": "Music",
      "Profile": "Profile",
      "Logout": "Logout",
      "Login": "Login",
      "Grid": "Grid",
      "List": "List",
      "SortBy": "Sort By",
      "Title": "Title",
      "Year": "Year",
      "Rating": "Rating",
      "Search": "Search...",
      "YourVote": "Your Vote",
      "Save": "Save",
      "UpdatingVote": "Updating existing vote",
      "NewVote": "Cast your vote",
      "MediaType": "Media Type",
      "Position": "Position",
      "Description": "Description",
      "Artist": "Artist",
      "ChangePassword": "Change Password",
      "CurrentPassword": "Current Password",
      "NewPassword": "New Password",
      "Update": "Update",
      "MyVotes": "My Votes",
      "NoVotes": "You haven't voted yet.",
      "Theme": "Theme",
      "Language": "Language"
    }
  },
  it: {
    translation: {
      "Movies": "Film",
      "Music": "Musica",
      "Profile": "Profilo",
      "Logout": "Esci",
      "Login": "Accedi",
      "Grid": "Griglia",
      "List": "Lista",
      "SortBy": "Ordina per",
      "Title": "Titolo",
      "Year": "Anno",
      "Rating": "Voto",
      "Search": "Cerca...",
      "YourVote": "Il tuo voto",
      "Save": "Salva",
      "UpdatingVote": "Modifica il tuo voto",
      "NewVote": "Vota ora",
      "MediaType": "Tipo Media",
      "Position": "Posizione",
      "Description": "Descrizione",
      "Artist": "Artista",
      "ChangePassword": "Cambia Password",
      "CurrentPassword": "Password Attuale",
      "NewPassword": "Nuova Password",
      "Update": "Aggiorna",
      "MyVotes": "I Miei Voti",
      "NoVotes": "Non hai ancora votato.",
      "Theme": "Tema",
      "Language": "Lingua"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
