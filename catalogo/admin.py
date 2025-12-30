from django.contrib import admin
from django.contrib.admin import helpers
from django import forms
from django.shortcuts import render
from django.http import HttpResponseRedirect
# Importiamo anche MEDIA_CHOICES per usarlo nel menu a tendina
from .models import Film, Musica, ApiKeys, MEDIA_CHOICES 

# --- 1. Form Generico per Modifica Multipla ---
class ModificaMassaForm(forms.Form):
    _selected_action = forms.CharField(widget=forms.MultipleHiddenInput)
    
    posizione_fisica = forms.CharField(
        required=False, 
        label="Nuova Posizione",
        widget=forms.TextInput(attrs={'placeholder': "Lascia vuoto per non cambiare"})
    )

    # NUOVO CAMPO: Tipo Supporto (Media Type)
    # Aggiungiamo un'opzione vuota all'inizio per permettere di non cambiare il valore
    # Usiamo MEDIA_CHOICES per creare i gruppi (Audio/Video) nel menu
    media_type = forms.ChoiceField(
        required=False,
        label="Tipo Supporto (Media)",
        choices=[('', '--- Lascia invariato ---')] + MEDIA_CHOICES
    )

# --- 2. Funzione per l'azione di massa ---
def modifica_in_massa(modeladmin, request, queryset):
    """
    Azione per aggiornare posizione, anno e media_type in massa.
    """
    if 'apply' in request.POST:
        form = ModificaMassaForm(request.POST)
        if form.is_valid():
            updates = {}
            
            # Gestione Posizione
            nuova_pos = form.cleaned_data.get('posizione_fisica')
            if nuova_pos:
                updates['posizione_fisica'] = nuova_pos

            # NUOVO: Gestione Media Type
            nuovo_media = form.cleaned_data.get('media_type')
            if nuovo_media:
                updates['media_type'] = nuovo_media
            
            # Esecuzione Update
            if updates:
                count = queryset.update(**updates)
                modeladmin.message_user(request, f"✅ Aggiornati {count} elementi.")
            else:
                modeladmin.message_user(request, "⚠️ Nessuna modifica applicata (campi vuoti).")
            
            return HttpResponseRedirect(request.get_full_path())
    else:
        form = ModificaMassaForm(initial={
            '_selected_action': request.POST.getlist(helpers.ACTION_CHECKBOX_NAME)
        })

    return render(request, 'admin/sposta_posizione.html', {
        'items': queryset,
        'form': form,
        'title': 'Modifica elementi in massa',
        'site_header': admin.site.site_header,
        'site_title': admin.site.site_title,
        'opts': modeladmin.model._meta,
        'media': modeladmin.media,
    })

modifica_in_massa.short_description = "Modifica massa (Posizione/Media)"


# --- 3. Configurazione Modelli ---

@admin.register(Film)
class FilmAdmin(admin.ModelAdmin):
    # Aggiungiamo 'media_type' alla lista visualizzata
    list_display = ('id', 'titolo', 'anno_uscita', 'media_type', 'posizione_fisica', 'imdb_tmdb_id')
    list_display_links = ('id', 'titolo')
    
    # Aggiungiamo 'media_type' anche ai filtri laterali
    list_filter = ('media_type', 'posizione_fisica', 'anno_uscita')
    
    search_fields = ('titolo', 'posizione_fisica')
    actions = [modifica_in_massa]

@admin.register(Musica)
class MusicaAdmin(admin.ModelAdmin):
    # Aggiungiamo 'media_type' alla lista visualizzata
    list_display = ('id', 'titolo', 'artista', 'anno_uscita', 'media_type', 'posizione_fisica')
    list_display_links = ('id', 'titolo')
    
    # Filtri laterali aggiornati
    list_filter = ('media_type', 'posizione_fisica', 'artista')
    
    search_fields = ('titolo', 'artista', 'posizione_fisica')
    actions = [modifica_in_massa]

@admin.register(ApiKeys)
class ApiKeysAdmin(admin.ModelAdmin):
    list_display = ('nome', 'user', 'key', 'utilizzi', 'created_at')
    readonly_fields = ('key', 'utilizzi', 'created_at')
    search_fields = ('user__username', 'nome', 'key')