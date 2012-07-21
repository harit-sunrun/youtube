from django.db import models
from vlists.apps.videos.models import Video
from django.contrib.auth.models import User
import logging
logging.getLogger().setLevel(logging.INFO)

class PlaylistManager(models.Manager):
	def add_playlist(self, name):
		playlist = Playlist(name=name)
		playlist.save()
		return playlist
	
	def get_playlist_with_id(self, id):
		return super(PlaylistManager, self).get_query_set().filter(pk=id)

class Playlist(models.Model):
	name = models.CharField(max_length=30)
	date_created = models.DateTimeField(auto_now_add=True)
	date_modified = models.DateTimeField(auto_now=True)
	deleted = models.BooleanField(default=False)
	objects = PlaylistManager() # is a customer manager
	
	def __repr__(self):
		return '<Playlist id:%s, name:%s, date_created:%s, deleted:%s>' % \
				(self.id, self.name, self.date_created, self.deleted)
	
	class Meta:
		db_table = 'playlists'
	

class PlaylistVideoManager(models.Manager):
	def add_video_to_playlist(self, video, playlist):
		"""
		if video is already added to playlist, don't add it again
		"""
		search_video = self.get_video_for_playlist(playlist, video)
		if search_video:
			logging.info('video is already added to playlist, will not re-add - ' + repr(playlist) + ', ' + repr(video))
		else:
			playlist_video = PlaylistVideo(video=video, playlist=playlist)
			playlist_video.save()
		return video
	
	def get_all_videos_for_playlist(self, playlist):
		videos_queryset = self.get_query_set().filter(playlist=playlist)
		videos = []
		if videos_queryset:
			for video in videos_queryset:
				videos.append(video)
		return videos
	
	def get_video_for_playlist(self, playlist, video):
		all_videos = self.get_all_videos_for_playlist(playlist)
		if all_videos:
			for vid in all_videos:
				if vid.pk == video.pk:
					return video	

class PlaylistVideo(models.Model):
	playlist = models.ForeignKey(Playlist)
	video = models.ForeignKey(Video)
	objects = PlaylistVideoManager()
	
	class Meta:
		db_table = 'playlists_videos'

class UserPlaylistManager(models.Manager):
	def get_or_create_playlist_for_user(self, user, playlist_name):
		# check if the playlist already exists for the user
		playlist = self.get_playlist_for_user_with_name(user, playlist_name)
		if not playlist:
			playlist = Playlist.objects.add_playlist(playlist_name)
			user_playlist = UserPlaylist(user=user, playlist=playlist)
			user_playlist.save()
			logging.info('playlist created: %s, %s' % (repr(playlist), repr(user)))
		else:
			logging.info('Playlist already exists: %s, %s' % (repr(playlist), repr(user)))
		return playlist

	def get_all_playlists_for_user(self, user):
		all_user_playlists = super(UserPlaylistManager, self).get_query_set().filter(user=user)
		# print type(all_user_playlists)
		playlists = []
		if all_user_playlists:
			for user_playlist in all_user_playlists:
				playlists.append(user_playlist.playlist)
		return playlists
		
	def get_playlist_for_user_with_name(self, user, playlist_name):
		all_user_playlists = self.get_all_playlists_for_user(user)
		if all_user_playlists:
			for playlist in all_user_playlists:
				if playlist.name == playlist_name:
					return playlist
		
class UserPlaylist(models.Model):
	user = models.ForeignKey(User)
	playlist = models.ForeignKey(Playlist)
	objects = UserPlaylistManager()
	
	def __repr__(self):
		return '<UserPlaylist id: %s> # <user id: %s> # <playlist id: %s>' % (self.id, self.user.id, self.playlist.id)
		
	class Meta:
		db_table = 'user_playlists'