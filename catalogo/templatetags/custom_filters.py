from django import template
from catalogo.models import Voto

register = template.Library()

@register.filter
def ha_votato(obj, user):
    """
    Restituisce True se l'utente ha già votato questo oggetto (Film o Musica).
    Uso: {% if film|ha_votato:request.user %}
    """
    if not user.is_authenticated:
        return False
    
    return obj.voti.filter(utente=user).exists()