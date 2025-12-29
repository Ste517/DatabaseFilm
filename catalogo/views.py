from django.shortcuts import render
from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Film, Musica, Voto
from django.db.models import Avg
from my_media_site.settings import VIEWS

@login_required
def salva_voto(request):
    if request.method == "POST":
        tipo = request.POST.get('tipo') # "film" o "musica"
        id_oggetto = request.POST.get('id_oggetto')
        valore = request.POST.get('valore')

        if id_oggetto and valore:
            try:
                if tipo == 'film':
                    # Cerca se esiste già un voto per questo utente e questo film
                    # Se c'è lo aggiorna, se no lo crea.
                    Voto.objects.update_or_create(
                        utente=request.user,
                        film_id=id_oggetto,
                        defaults={'valore': int(valore), 'musica': None}
                    )
                elif tipo == 'musica':
                    Voto.objects.update_or_create(
                        utente=request.user,
                        musica_id=id_oggetto,
                        defaults={'valore': int(valore), 'film': None}
                    )
            except Exception as e:
                print(f"Errore salvataggio voto: {e}")

    return redirect('home')

@login_required
def profilo(request):
    # Recuperiamo i voti dell'utente per mostrarli
    voti_utente = Voto.objects.filter(utente=request.user).order_by('-id')
    
    context = {
        'user': request.user,
        'voti': voti_utente
    }
    return render(request, 'catalogo/profile.html', context)

def homepage(request):
    # Recuperiamo tutti i film e la musica dal database
    films = Film.objects.annotate(media=Avg('voti__valore')).order_by('-id')
    album = Musica.objects.annotate(media=Avg('voti__valore')).order_by('-id')
    
    # Impacchettiamo i dati in un "contesto" da inviare alla pagina
    context = {
        'views': VIEWS,
        'films': films,
        'album': album
    }
    
    # Restituiamo la pagina HTML renderizzata (la creeremo al prossimo step)
    return render(request, 'catalogo/homepage.html', context)