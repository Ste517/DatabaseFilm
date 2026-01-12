from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import FilmViewSet, MusicaViewSet, VotoViewSet, AddElementApiView, UserViewSet

router = DefaultRouter()
router.register(r'films', FilmViewSet)
router.register(r'musica', MusicaViewSet)
router.register(r'voti', VotoViewSet, basename='voti')
router.register(r'user', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('aggiungi/', AddElementApiView.as_view(), name='api_aggiungi_drf'),
]
