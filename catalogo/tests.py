from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from .models import Film, Musica, Voto

class CatalogoTests(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.client = Client()

        # Create some data
        self.film = Film.objects.create(
            titolo="Test Film",
            anno_uscita=2023,
            posizione_fisica="Scaffale 1",
            media_type="bray"
        )

        self.musica = Musica.objects.create(
            titolo="Test Album",
            artista="Test Artist",
            anno_uscita=2023,
            posizione_fisica="Scaffale 2",
            media_type="cd"
        )

    def test_homepage_movies_view(self):
        """Test the homepage in movies view (default)"""
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'catalogo/homepage.html')

        # Check context
        self.assertTrue(response.context['views']['movies'])
        self.assertFalse(response.context['views']['music'])

        # Check content
        self.assertContains(response, "Test Film")
        self.assertNotContains(response, "Test Album")

        # Check for new CSS classes (verifying HTML cleanup)
        self.assertContains(response, 'class="header-controls"')
        self.assertContains(response, 'class="filter-select"')
        self.assertContains(response, 'class="card-title-row"')
        self.assertContains(response, 'class="card-details-row"')

    def test_homepage_music_view(self):
        """Test the homepage in music view"""
        response = self.client.get(reverse('music'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'catalogo/homepage.html')

        # Check context
        self.assertFalse(response.context['views']['movies'])
        self.assertTrue(response.context['views']['music'])

        # Check content
        self.assertContains(response, "Test Album")
        self.assertNotContains(response, "Test Film")

    def test_profile_view_login_required(self):
        """Test that profile view requires login"""
        response = self.client.get(reverse('profilo'))
        self.assertRedirects(response, '/login/?next=/profilo/')

    def test_profile_view_logged_in(self):
        """Test the profile view for logged in user"""
        self.client.login(username='testuser', password='password123')
        response = self.client.get(reverse('profilo'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'catalogo/profile.html')

        # Check for user info
        self.assertContains(response, "testuser")

        # Check for new CSS classes
        self.assertContains(response, 'class="profile-main-container"')
        self.assertContains(response, 'class="profile-header"')
        self.assertContains(response, 'class="profile-info-box"')

    def test_voting_functionality(self):
        """Test saving a vote"""
        self.client.login(username='testuser', password='password123')

        # Vote for the film
        response = self.client.post(reverse('salva_voto'), {
            'tipo': 'film',
            'id_oggetto': self.film.id,
            'valore': 8
        }, follow=True)

        self.assertEqual(response.status_code, 200)

        # Verify vote was created
        vote = Voto.objects.get(utente=self.user, film=self.film)
        self.assertEqual(vote.valore, 8)

        # Verify updated vote display on homepage (Movies view)
        response = self.client.get(reverse('home'))
        self.assertContains(response, '★ 8.0') # Checks if the badge is rendered

    def test_remove_vote(self):
        """Test removing a vote by sending value 0"""
        self.client.login(username='testuser', password='password123')

        # Create a vote first
        Voto.objects.create(utente=self.user, film=self.film, valore=8)

        # Remove vote
        response = self.client.post(reverse('salva_voto'), {
            'tipo': 'film',
            'id_oggetto': self.film.id,
            'valore': 0
        }, follow=True)

        self.assertEqual(response.status_code, 200)
        self.assertFalse(Voto.objects.filter(utente=self.user, film=self.film).exists())
