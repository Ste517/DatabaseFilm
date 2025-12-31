from django import template

register = template.Library()

@register.filter
def to_flag(country_code):
    # Mapping manuale per i casi in cui il codice lingua 
    # non corrisponde al codice nazione ISO
    mapping = {
        'en': 'gb',
        'ja': 'jp',
        'el': 'gr',
    }
    
    code = mapping.get(country_code.lower(), country_code.lower())
    
    if code:
    
        # Se il codice non è di 2 lettere (es. 'it'), restituisce il codice originale
        if len(code) != 2:
            return code

        # Trasforma le lettere in Regional Indicator Symbols
        return "".join(chr(ord(c) + 127397) for c in code.upper())
    
    return ""