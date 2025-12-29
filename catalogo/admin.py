from django.contrib import admin
from .models import Film, Musica, Voto

# Registriamo i modelli per vederli nel pannello di admin
admin.site.register(Film)
admin.site.register(Musica)