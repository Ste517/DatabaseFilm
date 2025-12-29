from django.urls import path
from . import views
from django.contrib.auth.views import LogoutView,LoginView

urlpatterns = [
    path('', views.homepage, name='home'),
    path('profilo/', views.profilo, name='profilo'),
    path('salva_voto/', views.salva_voto, name='salva_voto'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('login/', LoginView.as_view(template_name='catalogo/login.html'), name='login'),
]