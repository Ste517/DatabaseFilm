import time
import subprocess
import sys
import os
import platform
import urllib.request
import logging
import glob
from logging.handlers import RotatingFileHandler
from waitress import serve
from dotenv import load_dotenv
from my_media_site.settings import LOCAL_IP_ADDRESS

# --- CONFIGURAZIONE PATH E CARTELLE ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)
from my_media_site.wsgi import application 

# Cartella Logs
LOGS_DIR = os.path.join(BASE_DIR, "logs")
if not os.path.exists(LOGS_DIR):
    os.makedirs(LOGS_DIR)

# Nomi base
LATEST_LOG_NAME = "latest.log"
LATEST_LOG_PATH = os.path.join(LOGS_DIR, LATEST_LOG_NAME)
GEOIP_DB_PATH = os.path.join(BASE_DIR, "GeoLite2-City.mmdb")

# --- FUNZIONE DI ARCHIVIAZIONE INTELLIGENTE ---
def archive_old_logs():
    """
    Cerca TUTTI i file che iniziano con 'latest.log' (inclusi .1, .2...)
    e li rinomina con la data/ora corrente per archiviarli.
    """
    # Cerca il pattern: latest.log* (trova latest.log, latest.log.1, latest.log.2...)
    pattern = os.path.join(LOGS_DIR, f"{LATEST_LOG_NAME}*")
    files_to_archive = glob.glob(pattern)

    if not files_to_archive:
        return # Nessun vecchio log da archiviare

    # Timestamp univoco per questa archiviazione
    timestamp = time.strftime('%Y-%m-%d_%H-%M-%S')
    print(f"📦 Archiviazione sessione precedente ({len(files_to_archive)} file)...")

    for file_path in files_to_archive:
        try:
            # Estrae il nome file (es. latest.log.1)
            filename = os.path.basename(file_path)
            
            # Crea il nuovo nome sostituendo 'latest.log' con 'log_TIMESTAMP.txt'
            # Esempio: latest.log.1  -->  log_2026-01-01_12-00.txt.1
            new_filename = filename.replace(LATEST_LOG_NAME, f"log_{timestamp}.txt")
            new_path = os.path.join(LOGS_DIR, new_filename)
            
            os.rename(file_path, new_path)
        except Exception as e:
            print(f"⚠️ Errore archiviazione file {filename}: {e}")

# Eseguiamo l'archiviazione SOLO se siamo in modalità worker
if len(sys.argv) > 1 and sys.argv[1] == '--worker':
    archive_old_logs()

# --- SETUP LOGGER ---
logger = logging.getLogger("AccessLog")
logger.setLevel(logging.INFO)

# RotatingFileHandler:
# maxBytes=10MB. Se supera 10MB crea latest.log.1, latest.log.2...
# Al riavvio successivo, TUTTI questi verranno rinominati dalla funzione sopra.
handler = RotatingFileHandler(LATEST_LOG_PATH, maxBytes=10*1024*1024, backupCount=5, encoding='utf-8')
formatter = logging.Formatter('[%(asctime)s] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
handler.setFormatter(formatter)
logger.addHandler(handler)
# --------------------

# --- CONFIGURAZIONE GEOIP ---
GEOIP_AVAILABLE = False
try:
    import geoip2.database
    from geoip2.errors import AddressNotFoundError
    if os.path.exists(GEOIP_DB_PATH):
        GEOIP_AVAILABLE = True
        print("🌍 Modulo GeoIP2 caricato e Database trovato!")
    else:
        print(f"⚠️  Libreria GeoIP2 ok, ma file '{GEOIP_DB_PATH}' mancante.")
except ImportError:
    print("⚠️  Libreria 'geoip2' non installata.")

PORT = 8080

load_dotenv()
DOMAIN_NAME = os.getenv('DOMAIN_NAME')
DUCKDNS_TOKEN = os.getenv('DUCKDNS_TOKEN')

HELP_MESSAGE = "Utility Server Django + Caddy + DuckDNS + Smart Logging"


def get_geo_info(ip):
    if not GEOIP_AVAILABLE: return None
    if ip == "127.0.0.1" or ip == "::1" or ip.startswith("192.168.") or ip.startswith("10.") or ip.startswith("172."):
        return "🏠 LAN/Locale"
    try:
        with geoip2.database.Reader(GEOIP_DB_PATH) as reader:
            response = reader.city(ip)
            city_str = f", {response.city.name}" if response.city.name else ""
            return f"🌍 {response.country.name}{city_str}"
    except AddressNotFoundError: return "Unknown"
    except Exception: return "?"

class AccessLoggerMiddleware:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        client_ip = environ.get('HTTP_X_REAL_IP') or environ.get('REMOTE_ADDR')
        path = environ.get('PATH_INFO')
        method = environ.get('REQUEST_METHOD')
        
        if not path.startswith('/static/'):
            geo = get_geo_info(client_ip)
            
            # Log su File (latest.log)
            geo_text = f" ({geo})" if geo else ""
            logger.info(f"{client_ip}{geo_text} --> {method} {path}")
            
            # Log su Console (Colorato)
            time_console = time.strftime('%H:%M:%S')
            color_ip = f"\033[93m{client_ip}\033[0m"
            color_geo = f"(\033[96m{geo}\033[0m)" if geo else ""
            print(f"📡 [{time_console}] {color_ip} {color_geo} --> {method} {path}")

        return self.app(environ, start_response)

def update_duckdns():
    if not DOMAIN_NAME or not DUCKDNS_TOKEN:
        print("⚠️  DuckDNS non configurato. Salto.")
        return
    print(f"🦆 Aggiornamento DuckDNS per {DOMAIN_NAME}...")
    try:
        url = f"https://www.duckdns.org/update?domains={DOMAIN_NAME}&token={DUCKDNS_TOKEN}"
        with urllib.request.urlopen(url, timeout=5) as response:
            res = response.read().decode('utf-8')
            if res == "OK": print("✅ DuckDNS aggiornato!")
            else: print(f"❌ Errore DuckDNS: {res}")
    except Exception as e: print(f"❌ Errore connessione DuckDNS: {e}")

def get_caddy_path():
    system_name = platform.system()
    filename = "caddy.exe" if system_name == "Windows" else "caddy"
    caddy_path = os.path.join(BASE_DIR, filename)
    if not os.path.exists(caddy_path):
        import shutil
        caddy_path = shutil.which("caddy")
    return caddy_path

def create_caddyfile():
    print(f"📝 Generazione Caddyfile...")
    proxy_block = f"""
        reverse_proxy localhost:{PORT} {{
            header_up X-Real-IP {{remote_host}}
        }}
    """
    caddy_content = f"localhost {{\n{proxy_block}\n}}\n"
    if DOMAIN_NAME:
        caddy_content += f"{DOMAIN_NAME} {{\n{proxy_block}\n}}\n"
    caddy_content += f"{LOCAL_IP_ADDRESS} {{\n{proxy_block}\ntls internal\n}}\n"
    
    with open(os.path.join(BASE_DIR, "Caddyfile"), "w") as f:
        f.write(caddy_content)

def start_caddy_service(caddy_exe_path) -> subprocess.Popen:
    print(f"🚀 Avvio di Caddy...")
    process = subprocess.Popen([caddy_exe_path, "run"], stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True, cwd=BASE_DIR)
    time.sleep(2)
    if process.poll() is not None:
        _, err = process.communicate()
        print(f"\n❌ ERRORE Caddy:\n{err}")
        raise Exception("Caddy crash")
    print("✅ Caddy attivo.")
    return process

def run_worker():
    load_dotenv()
    try:
        print("-------------------------------------------------------")
        print(f"🟢 Waitress attivo su porta {PORT}")
        if DOMAIN_NAME: print(f"🌍 Esterno: https://{DOMAIN_NAME}")
        print(f"🏠 Interno: https://{LOCAL_IP_ADDRESS}")
        print(f"📄 Log Corrente: logs/latest.log")
        print("-------------------------------------------------------")
        serve(AccessLoggerMiddleware(application), host='0.0.0.0', port=PORT, trusted_proxy='*')
    except Exception as e:
        print(f"Errore Django: {e}")

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--worker':
        run_worker()
        sys.exit()
    elif len(sys.argv) > 1 and sys.argv[1] == '--help':
        print(HELP_MESSAGE)
        sys.exit()
    else:
        print("🤖 Supervisore avviato.")
        caddy_executable = get_caddy_path()
        if not caddy_executable:
            print("❌ Caddy non trovato.")
            sys.exit(1)

        while True:
            caddy_process = None
            django_process = None
            try:
                update_duckdns()
                create_caddyfile()
                caddy_process = start_caddy_service(caddy_executable)
                django_process = subprocess.Popen([sys.executable, __file__, '--worker'])
                
                print("👉 Premi CTRL+C per fermare il server.")
                django_process.wait()
                
            except KeyboardInterrupt:
                print("\n\n🛑 Chiusura processi...")
                if django_process: django_process.terminate()
                if caddy_process: caddy_process.terminate()
                
                scelta = input("🔄 Vuoi riavviare tutto? (Invio=Sì, n=Esci): ").lower()
                if scelta == 'n':
                    break
                print("♻️  Riavvio completo in corso...\n")
                time.sleep(1)
            except Exception as e:
                print(f"Errore critico: {e}")
                if django_process: django_process.terminate()
                if caddy_process: caddy_process.terminate()
                break