from django.shortcuts import render
from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Film, Musica, Voto, ApiKeys
from django.db.models import Avg
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from urllib.parse import urlparse

@login_required
def salva_voto(request):
    if request.method == "POST":
        tipo = request.POST.get('tipo') # "film" o "musica"
        id_oggetto = request.POST.get('id_oggetto')
        valore = request.POST.get('valore')
        referer_url = request.META.get('HTTP_REFERER')
        target_url = '/'

        if id_oggetto and valore:
            try:
                if tipo == 'film':
                    # Cerca se esiste già un voto per questo utente e questo film
                    # Se c'è lo aggiorna, se no lo crea.
                    if int(valore) == 0:
                        Voto.objects.filter(utente=request.user,film_id=id_oggetto).delete()
                    else:
                        Voto.objects.update_or_create(
                            utente=request.user,
                            film_id=id_oggetto,
                            defaults={'valore': int(valore), 'musica': None}
                        )
                elif tipo == 'musica':
                    if int(valore) == 0:
                        Voto.objects.filter(utente=request.user,musica_id=id_oggetto).delete()
                    else:
                        Voto.objects.update_or_create(
                            utente=request.user,
                            musica_id=id_oggetto,
                            defaults={'valore': int(valore), 'film': None}
                        )
                if referer_url:
                    parsed = urlparse(referer_url)
                    target_url = parsed.path
                    target_url += f"#disk_{id_oggetto}"
                    if parsed.path == '/profilo/':
                        target_url += f"_{tipo}"
            except Exception as e:
                print(f"Errore salvataggio voto: {e}")
    
    return redirect(target_url)
    

@login_required
def profilo(request):
    # Recuperiamo i voti dell'utente per mostrarli
    voti_utente = Voto.objects.filter(utente=request.user).order_by('-id')
    
    context = {
        'user': request.user,
        'voti': voti_utente
    }
    return render(request, 'catalogo/profile.html', context)

def homepage(request, view):
    if view == 'music':
        views = {"music": True,"movies": False,}
    else:
        views = {"music": False,"movies": True,}

    sort_film = request.GET.get('sort_film')
    if not sort_film:
        sort_film = request.COOKIES.get('saved_sort_film', '-id')

    sort_musica = request.GET.get('sort_musica')
    if not sort_musica:
        sort_musica = request.COOKIES.get('saved_sort_musica', '-id')
    
    if sort_film == 'media_type':
        films = Film.objects.annotate(media=Avg('voti__valore')).order_by('media_type','titolo')
    else:
        films = Film.objects.annotate(media=Avg('voti__valore')).order_by(sort_film)
    
    if sort_musica == 'titolo':
        album = Musica.objects.annotate(media=Avg('voti__valore')).order_by('artista', 'titolo')
    elif sort_musica == '-titolo':
        album = Musica.objects.annotate(media=Avg('voti__valore')).order_by('-artista', '-titolo')
    elif sort_musica == 'media_type':
        album = Musica.objects.annotate(media=Avg('voti__valore')).order_by('media_type', 'artista', 'titolo')
    else:
        album = Musica.objects.annotate(media=Avg('voti__valore')).order_by(sort_musica)
    
    context = {
        'views': views,
        'films': films,
        'album': album,
        'current_sort_film': sort_film,
        'current_sort_musica': sort_musica
    }
    
    response = render(request, 'catalogo/homepage.html', context)

    # Salvo il sort per un giorno
    response.set_cookie('saved_sort_film', sort_film, max_age=86400)
    response.set_cookie('saved_sort_musica', sort_musica, max_age=86400)
    
    return response

@csrf_exempt
def aggiungi_elemento_api(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON non valido'}, status=400)

        # 1. CERCA LA API KEY (supporta sia Header che Body)
        # È buona pratica passare le chiavi nell'header 'X-API-KEY'
        api_key = request.headers.get('X-API-KEY') or data.get('api_key')

        if not api_key:
            return JsonResponse({'error': 'API Key mancante'}, status=401)

        # 2. VALIDAZIONE CHIAVE
        try:
            key_obj = ApiKeys.objects.get(key=api_key)
        except ApiKeys.DoesNotExist:
            return JsonResponse({'error': 'API Key non valida'}, status=403)

        # 3. VERIFICA PERMESSI UTENTE
        # La chiave è valida, ma l'utente proprietario ha i permessi di staff?
        if not key_obj.user.is_staff:
            return JsonResponse({'error': 'L\'utente associato a questa chiave non ha permessi di amministrazione'}, status=403)

        # 4. ESECUZIONE AZIONE
        tipo = data.get('tipo') # "film" o "musica"
        
        try:
            titolo_creato = ""
            
            if tipo == 'film':
                nuovo_film = Film.objects.create(
                    imdb_tmdb_id=data.get('id_riferimento'),
                    posizione_fisica=data.get('posizione', 'Libreria')
                )
                titolo_creato = nuovo_film.titolo
                
            elif tipo == 'musica':
                nuova_musica = Musica.objects.create(
                    spotify_url=data.get('id_riferimento'),
                    posizione_fisica=data.get('posizione', 'Libreria')
                )
                titolo_creato = nuova_musica.titolo
            
            else:
                return JsonResponse({'error': 'Tipo non valido (usa "film" o "musica")'}, status=400)

            # 5. INCREMENTA CONTATORE (Solo se l'operazione ha avuto successo)
            key_obj.utilizzi += 1
            key_obj.save()

            return JsonResponse({
                'success': True, 
                'titolo': titolo_creato,
                'utilizzi_chiave': key_obj.utilizzi
            })

        except Exception as e:
            return JsonResponse({'error': f"Errore interno: {str(e)}"}, status=500)

    return JsonResponse({'error': 'Metodo non permesso'}, status=405)