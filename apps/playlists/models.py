from django.db import models
from vlists.apps.videos.models import Video
from django.contrib.auth.models import User

class PlaylistManager(models.Manager):
	"""
	This class will be responsible for following tasks
	a.) add video to playlist
	b.) get video(s) for playlist
	c.) create new playlist
	d.) deletes existing playlist
	e.) updates existing playlist name
	Note: All of these functions require a user to perform these operations
	"""
	def addVideoToPlaylist(user, video):
		if not (user and video):
			raise ValueError('User or Video information is missing')
		"""
		- get/create video
		- get/create playlistVideo
		- get/create playlist
		- get/create userPlaylist
		"""

class Playlist(models.Model):
	name = models.CharField(max_length=30)
	date_created = models.DateTimeField(auto_now_add=True)
	date_modified = models.DateTimeField(auto_now=True)
	deleted = models.BooleanField(default=False)
	objects = PlaylistManager() # is a customer manager
	
	class Meta:
		db_table = 'playlists'
	
class PlaylistVideo(models.Model):
	playlist = models.ForeignKey(Playlist)
	video = models.ForeignKey(Video)
	
	class Meta:
		db_table = 'playlists_videos'
		
class UserPlaylist(models.Model):
	user = models.ForeignKey(User)
	playlist = models.ForeignKey(Playlist)
	
	class Meta:
		db_table = 'user_playlists'
		

		
		
		
		
		
		
		
		
		