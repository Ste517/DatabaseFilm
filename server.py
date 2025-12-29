from waitress import serve
import os
import sys

from dotenv import load_dotenv
from my_media_site.settings import LOCAL_IP_ADDRESS

PORTS = [8080]

load_dotenv()

# Aggiunge la cartella corrente al path per trovare i moduli
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# IMPORTANTE: Cambia 'DatabaseFilm' con il nome reale della tua cartella di progetto!
# (È la cartella che contiene wsgi.py)
from my_media_site.wsgi import application 

if __name__ == '__main__':
    for port in PORTS:
        try:
            print("-------------------------------------------------------")
            print("🎬  Server avviato con Waitress!")
            print(f"👉  Apri il browser su: http://localhost:{port}")
            print(f"👉  Sugli altri dispositivi su: http://{LOCAL_IP_ADDRESS}:{port}")
            print("-------------------------------------------------------")
            serve(application, host='0.0.0.0', port=port)
            break
        except Exception as e:
            print(f"\nThere was a problem with port {port}\n\n{e}\n")
        