from rest_framework import serializers
from .models import Film, Musica, Voto, ApiKeys

class FilmSerializer(serializers.ModelSerializer):
    media_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Film
        fields = '__all__'

class MusicaSerializer(serializers.ModelSerializer):
    media_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Musica
        fields = '__all__'

class VotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voto
        fields = ['id', 'utente', 'film', 'musica', 'valore']
        read_only_fields = ['utente']

    def validate(self, data):
        """
        Check that either film or musica is provided, but not both.
        """
        film = data.get('film')
        musica = data.get('musica')

        if not film and not musica:
            raise serializers.ValidationError("Devi specificare un film o un album.")
        if film and musica:
            raise serializers.ValidationError("Non puoi votare entrambi contemporaneamente.")
        return data

class ApiKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = ApiKeys
        fields = ['key', 'nome', 'utilizzi']
        read_only_fields = ['key', 'utilizzi']
