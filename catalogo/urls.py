from django.urls import path
from . import views
from django.contrib.auth.views import LogoutView,LoginView

# views = {"music": True,"movies": True,}

urlpatterns = [
    path('', views.homepage, {'view':'movies'}, name='home'),
    path('music/', views.homepage, {'view':'music'}, name='music'),
    path('profilo/', views.profilo, name='profilo'),
    path('salva_voto/', views.salva_voto, name='salva_voto'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('login/', LoginView.as_view(template_name='catalogo/login.html'), name='login'),
    path('api/aggiungi/', views.aggiungi_elemento_api, name='api_aggiungi'),
    path('netflix/', views.homepage, {'view':'netflix'},name='netflix')
]