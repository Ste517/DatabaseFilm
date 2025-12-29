from django.contrib import admin
from .models import Film, Musica, ApiKeys

# Registriamo i modelli per vederli nel pannello di admin
admin.site.register(Film)
admin.site.register(Musica)

@admin.register(ApiKeys)
class ApiKeysAdmin(admin.ModelAdmin):
    list_display = ('nome', 'user', 'key', 'utilizzi', 'created_at')
    readonly_fields = ('key', 'utilizzi', 'created_at') # Rende la chiave e il contatore non modificabili a mano
    
    # Opzionale: Permette di cercare per username o nome chiave
    search_fields = ('user__username', 'nome', 'key')