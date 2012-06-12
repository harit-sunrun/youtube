from django.db import models
from apps.videos.models import Video

class Playlist(models.Model):
	name = models.CharField(max_length=30)
	date_created = models.DateTimeField(auto_now_add=True)
	date_modified = models.DateTimeField(auto_now=True)
	deleted = models.BooleanField(default=False)
	
	class Meta:
		db_table = 'playlists'
	
class PlaylistVideo(models.Model):
	playlist = models.ForeignKey(Playlist)
	video = models.ForeignKey(Video)
	
	class Meta:
		db_table = 'playlists_videos'