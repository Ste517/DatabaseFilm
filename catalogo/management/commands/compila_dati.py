from catalogo.models import Film

from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, User


class Command(BaseCommand):
    help = 'Add films to the database'

    def add_arguments(self, parser):
        parser.add_argument('spot', help='Where are these movies put')
        parser.add_argument('type', help='TMDB or IMDB (tmdb/imdb)')
        parser.add_argument('ids', nargs='+', help='IDs to add')

    def handle(self, *args, **options):
        spot = options['spot']
        type: str = options['type']
        ids = options['ids']
        type.strip()
        if type == "tmdb" or type == "imdb":
            added = 0
            for id in ids:
                temp = Film.objects.create()
                temp.imdb_tmdb_id=f"{type}:{id}"
                temp.posizione_fisica=spot
                temp.save()
                self.stdout.write(self.style.SUCCESS(f'Added {temp.titolo} to the database'))
                added+=1
                
            self.stdout.write(self.style.SUCCESS(f'Done. Added {added} movies to the database'))
        else:
            self.stdout.write(self.style.ERROR("Invalid source database type"))