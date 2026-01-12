from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.db.models import Avg
from .models import Film, Musica, Voto, ApiKeys
from .serializers import FilmSerializer, MusicaSerializer, VotoSerializer
import json

class FilmViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows films to be viewed or edited.
    """
    queryset = Film.objects.annotate(media_rating=Avg('voti__valore')).order_by('-id')
    serializer_class = FilmSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titolo']
    ordering_fields = ['titolo', 'anno_uscita', 'media_rating', 'posizione_fisica']

class MusicaViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows music albums to be viewed or edited.
    """
    queryset = Musica.objects.annotate(media_rating=Avg('voti__valore')).order_by('-id')
    serializer_class = MusicaSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titolo', 'artista']
    ordering_fields = ['titolo', 'artista', 'anno_uscita', 'media_rating', 'posizione_fisica']

class VotoViewSet(viewsets.ModelViewSet):
    """
    API endpoint for handling user votes.
    Users can only see and edit their own votes.
    """
    serializer_class = VotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Voto.objects.filter(utente=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user to the current logged-in user
        # Check if vote exists and update it instead?
        # The frontend logic was: "Se c'è lo aggiorna, se no lo crea."
        # The serializer validates uniqueness, but here we might want to handle upsert behavior.
        # But standard DRF create will fail on uniqueness constraint.
        # Let's handle upsert logic in create manually or rely on client to use ID for updates.
        # Ideally client checks if vote exists. But to mimic `salva_voto` logic:

        film = serializer.validated_data.get('film')
        musica = serializer.validated_data.get('musica')
        valore = serializer.validated_data.get('valore')

        if film:
            Voto.objects.update_or_create(
                utente=self.request.user,
                film=film,
                defaults={'valore': valore, 'musica': None}
            )
        elif musica:
            Voto.objects.update_or_create(
                utente=self.request.user,
                musica=musica,
                defaults={'valore': valore, 'film': None}
            )
        # Note: We are intercepting save, so we don't call super().save() or serializer.save()
        # if we do update_or_create manually.
        # However, to keep it clean with DRF response, we might need to return the instance.

    def create(self, request, *args, **kwargs):
        # We need to manually validate because serializer.is_valid() would fail
        # on the unique constraint if the vote already exists.

        # 1. Instantiate serializer to validate types and required fields,
        # but ignoring uniqueness for now (or catching it).
        # Easier approach: Use the serializer but catch validation error if it's just uniqueness?
        # No, let's just use `update_or_create` logic directly if basic validation passes.

        # Let's clean the data first
        data = request.data.copy()

        # We can't trust `is_valid` fully for upsert if it checks uniqueness.
        # But we need it for field validation (e.g. valid film ID).

        # Workaround: Check existence manually first.
        film_id = data.get('film')
        musica_id = data.get('musica')
        valore = data.get('valore')

        if not film_id and not musica_id:
             return Response({'error': 'Devi specificare un film o un album.'}, status=status.HTTP_400_BAD_REQUEST)

        instance = None
        created = False

        try:
            if film_id:
                instance, created = Voto.objects.update_or_create(
                    utente=request.user,
                    film_id=film_id,
                    defaults={'valore': valore}
                )
            elif musica_id:
                instance, created = Voto.objects.update_or_create(
                    utente=request.user,
                    musica_id=musica_id,
                    defaults={'valore': valore}
                )
        except Exception as e:
            # Catch invalid IDs or other db errors
             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Re-serialize the instance to return
        return Response(self.get_serializer(instance).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class AddElementApiView(APIView):
    """
    Endpoint to add elements via API Key (legacy support / automation).
    """
    permission_classes = [permissions.AllowAny] # We handle auth manually via API Key

    def post(self, request, format=None):
        # 1. Search for API Key
        api_key = request.headers.get('X-API-KEY') or request.data.get('api_key')

        if not api_key:
            return Response({'error': 'API Key mancante'}, status=status.HTTP_401_UNAUTHORIZED)

        # 2. Validate Key
        try:
            key_obj = ApiKeys.objects.get(key=api_key)
        except ApiKeys.DoesNotExist:
            return Response({'error': 'API Key non valida'}, status=status.HTTP_403_FORBIDDEN)

        # 3. Check Permissions
        if not key_obj.user.is_staff:
            return Response({'error': 'L\'utente associato a questa chiave non ha permessi di amministrazione'}, status=status.HTTP_403_FORBIDDEN)

        # 4. Action
        tipo = request.data.get('tipo')

        try:
            titolo_creato = ""

            if tipo == 'film':
                nuovo_film = Film.objects.create(
                    imdb_tmdb_id=request.data.get('id_riferimento'),
                    posizione_fisica=request.data.get('posizione', 'Libreria')
                )
                titolo_creato = nuovo_film.titolo

            elif tipo == 'musica':
                nuova_musica = Musica.objects.create(
                    spotify_url=request.data.get('id_riferimento'),
                    posizione_fisica=request.data.get('posizione', 'Libreria')
                )
                titolo_creato = nuova_musica.titolo

            else:
                return Response({'error': 'Tipo non valido (usa "film" o "musica")'}, status=status.HTTP_400_BAD_REQUEST)

            # 5. Increment Counter
            key_obj.utilizzi += 1
            key_obj.save()

            return Response({
                'success': True,
                'titolo': titolo_creato,
                'utilizzi_chiave': key_obj.utilizzi
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': f"Errore interno: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
