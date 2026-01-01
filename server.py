import time
import subprocess
import sys
import os
import platform
from waitress import serve
from dotenv import load_dotenv
from my_media_site.settings import LOCAL_IP_ADDRESS

PORT = 8080

# Aggiunge il path del progetto
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)
from my_media_site.wsgi import application 

HELP_MESSAGE = "Questo è il file utility per avviare il server Django..."

def get_caddy_path():
    """Restituisce il percorso assoluto dell'eseguibile Caddy in base all'OS"""
    system_name = platform.system()
    
    if system_name == "Windows":
        filename = "caddy.exe"
    else:
        filename = "caddy" # Linux / Mac
    
    caddy_path = os.path.join(BASE_DIR, filename)
    
    if not os.path.exists(caddy_path):
        # Prova a vedere se è installato globalmente nel sistema
        import shutil
        caddy_path = shutil.which("caddy")
        
    return caddy_path

def create_caddyfile():
    print(f"📝 Generazione Caddyfile per IP: {LOCAL_IP_ADDRESS}")
    caddy_content = f"""
    {LOCAL_IP_ADDRESS} {{
        reverse_proxy localhost:{PORT}
    }}

    localhost {{
        reverse_proxy localhost:{PORT}
    }}
    """
    caddyfile_path = os.path.join(BASE_DIR, "Caddyfile")
    with open(caddyfile_path, "w") as f:
        f.write(caddy_content)

def start_caddy_service(caddy_exe_path) -> subprocess.Popen:
    """Avvia Caddy come sottoprocesso"""
    print(f"🚀 Avvio di Caddy ({caddy_exe_path})...")
    
    # Avviamo Caddy catturando stderr per il debug
    process = subprocess.Popen(
        [caddy_exe_path, "run"], 
        stdout=subprocess.DEVNULL, # Silenzia output normale
        stderr=subprocess.PIPE,    # Cattura gli errori
        text=True,                 # Leggi come testo
        cwd=BASE_DIR               # Assicura che lavori nella cartella giusta
    )
    
    # Aspetta un attimo per vedere se crasha subito
    time.sleep(1.5)
    
    if process.poll() is not None:
        _, err_output = process.communicate()
        print("\n❌ ERRORE: Caddy non è partito.")
        print("Ecco il messaggio di errore di Caddy:\n")
        print("-------------------------------------------------------")
        print(err_output)
        print("-------------------------------------------------------")
        if "permission denied" in err_output.lower() and platform.system() != "Windows":
            print("\n💡 SUGGERIMENTO LINUX: Sembra un problema di permessi.")
            print(f"Esegui questo comando nel terminale: sudo setcap cap_net_bind_service=+ep {caddy_exe_path}")
        
        raise Exception("Caddy avvio fallito")
    else:
        print("✅ Caddy avviato con successo.")

    return process

def run_worker():
    """Questa funzione esegue SOLO Django/Waitress"""
    load_dotenv()
    # NON avviare Caddy qui, è già gestito dal supervisore
    try:
        print("-------------------------------------------------------")
        print(f"🟢 Django (Waitress) attivo su https://localhost:{PORT}")
        print(f"🔒 HTTPS (Caddy) attivo su https://{LOCAL_IP_ADDRESS}")
        print("-------------------------------------------------------")
        serve(application, host='0.0.0.0', port=PORT, trusted_proxy='127.0.0.1')
    except Exception as e:
        print(f"Errore nell'esecuzione di Django: {e}")

if __name__ == '__main__':
    # 1. GESTIONE ARGOMENTI HELP
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print(HELP_MESSAGE)
        sys.exit()

    # 2. MODALITÀ WORKER (Solo Django)
    elif len(sys.argv) > 1 and sys.argv[1] == '--worker':
        run_worker()
        sys.exit()

    # 3. MODALITÀ SUPERVISORE (Main)
    else:
        create_caddyfile()
        
        print("-------------------------------------------------------")
        print("🤖 Supervisore avviato.")
        
        caddy_process = None
        caddy_executable = get_caddy_path() # Troviamo il percorso qui

        if not caddy_executable:
            print(f"❌ ERRORE CRITICO: Eseguibile 'caddy' non trovato in {BASE_DIR}")
            print("Su Windows deve chiamarsi 'caddy.exe', su Linux 'caddy'.")
            sys.exit(1)

        try:
            # Avviamo Caddy UNA volta sola, passando il percorso trovato
            
            print("👉 Premi CTRL+C per fermare il server e scegliere se riavviare.")
            
            # --- LOOP DI RIAVVIO DJANGO ---
            while True:
                # Avvia se stesso in modalità worker
                caddy_process = start_caddy_service(caddy_executable)
                p = subprocess.Popen([sys.executable, __file__, '--worker'])
                
                try:
                    p.wait()
                except KeyboardInterrupt:
                    p.terminate()
                    if caddy_process and caddy_process.poll() is None:
                        print("🛑 Chiusura di Caddy...")
                        caddy_process.terminate()
                    print("\n\n🛑 Server Django fermato.")
                    
                    scelta = input("🔄 Vuoi riavviare Django? (Invio per SÌ, 'n' per uscire): ").lower()
                    if scelta == 'n':
                        break
                    
                    print("♻️  Riavvio Django in corso...\n")
                    time.sleep(1)
        
        except Exception as e:
            print(f"Chiusura per errore: {e}")
        finally:
            if caddy_process and caddy_process.poll() is None:
                print("🛑 Chiusura di Caddy...")
                caddy_process.terminate()