from django.test import TransactionTestCase
from models import Playlist
from models import UserPlaylist
from models import PlaylistVideo
from vlists.apps.videos.models import Video
from django.contrib.auth.models import User

"""
The idea is that each call to create playlist will make a new playlist
because two users can have playlists with same name but both of those 
playlists may have different videos, so even if names of playlists are same
they represent different objects in database
"""

PLAYLIST = 'playlist'
class Utility():
	@staticmethod
	def create_playlist(playlist_name=PLAYLIST):
		return Playlist.objects.add_playlist(playlist_name)
	
	@staticmethod
	def create_user(name='test', email='test', passwd='test'):
		return User.objects.create_user(name, email, passwd)
	
	@staticmethod
	def create_video(title='title', url='url'):
		return Video.objects.get_or_create_video(title, url)

			
class PlaylistTest(TransactionTestCase):		
	def test_add_one_playlist(self):
		Utility.create_playlist()
		self.assertEqual(Playlist.objects.count(), 1, msg='playlist count is not 1, it is ' + str(Playlist.objects.count()))
		
	def test_add_two_playlists_with_same_name(self):
		Utility.create_playlist()
		Utility.create_playlist()
		self.assertEqual(Playlist.objects.count(), 2, msg='playlist count is not 2, it is ' + str(Playlist.objects.count()))
	
	def test_add_two_playlists_with_different_name(self):
		Utility.create_playlist()
		Utility.create_playlist('playlist1')
		self.assertEqual(Playlist.objects.count(), 2, msg='playlist count is not 2, it is ' + str(Playlist.objects.count()))
		
	def test_get_playlist(self):
		playlist = Utility.create_playlist()
		self.assertEqual(Playlist.objects.get_playlist_with_id(playlist.id).count(), 1, msg='playlist count is not 1, it is ' + str(Playlist.objects.get_playlist_with_id(playlist.id).count()))
		self.assertEqual(Playlist.objects.get_playlist_with_id(playlist.id)[0].id, playlist.id) # [0] is used because we inserted just one playlist
		
class UserPlaylistTest(TransactionTestCase):
	def test_add_different_playlist_for_same_user(self):
		user = Utility.create_user()
		UserPlaylist.objects.get_or_create_playlist_for_user(user, PLAYLIST)
		UserPlaylist.objects.get_or_create_playlist_for_user(user, 'playlist1')
		self.assertEqual(len(UserPlaylist.objects.get_all_playlists_for_user(user)), 2, msg='user playlist count is not 2, it is ' + str(len(UserPlaylist.objects.get_all_playlists_for_user(user))))
	
	def test_add_same_playlist_twice_for_same_user(self):
		"""
		desired : The playlist should be added once. one user will have unique playlists names
		"""
		user = Utility.create_user()
		UserPlaylist.objects.get_or_create_playlist_for_user(user, PLAYLIST)
		UserPlaylist.objects.get_or_create_playlist_for_user(user, PLAYLIST)
		self.assertEqual(len(UserPlaylist.objects.get_all_playlists_for_user(user)), 1, msg='user playlist count is not 1, it is ' + str(len(UserPlaylist.objects.get_all_playlists_for_user(user))))
	
	def test_add_same_playlist_with_same_name_for_different_users(self):
		user1 = Utility.create_user('user1')
		user2 = Utility.create_user('user2')
		user3 = Utility.create_user('user3')
		UserPlaylist.objects.get_or_create_playlist_for_user(user1, PLAYLIST)
		UserPlaylist.objects.get_or_create_playlist_for_user(user2, PLAYLIST)
		
		# total number of playlists should be 2, becaue even if playlist have same name
		# they belong to different user
		self.assertEqual(Playlist.objects.count(), 2, msg='playlist count is not 2, it is ' + str(Playlist.objects.count()))
		self.assertEqual(len(UserPlaylist.objects.get_all_playlists_for_user(user1)), 1, msg='playlists count for user1 is not 1, it is ' + str(len(UserPlaylist.objects.get_all_playlists_for_user(user1))))
		self.assertEqual(len(UserPlaylist.objects.get_all_playlists_for_user(user2)), 1, msg='playlists count for user2 is not 1, it is ' + str(len(UserPlaylist.objects.get_all_playlists_for_user(user2))))
		self.assertEqual(len(UserPlaylist.objects.get_all_playlists_for_user(user3)), 0, msg='playlists count for user3 is not 0, it is ' + str(len(UserPlaylist.objects.get_all_playlists_for_user(user3))))
		
class PlaylistVideoTest(TransactionTestCase):
	def test_add_video_to_playlist(self):
		video = Utility.create_video()
		playlist = Utility.create_playlist()
		PlaylistVideo.objects.add_video_to_playlist(video, playlist)
		self.assertEqual(PlaylistVideo.objects.count(), 1, msg='playlist video count is not 1, it is ' + str(PlaylistVideo.objects.count()))
		self.assertEqual(len(PlaylistVideo.objects.get_all_videos_for_playlist(playlist)), 1, msg='videos count in playlist is not 1, it is ' + str(len(PlaylistVideo.objects.get_all_videos_for_playlist(playlist))))
	
	def test_add_same_video_twice_to_one_playlist(self):
		"""
		desired: same video added twice to one playlist should not add it twice in database
		"""
		video = Utility.create_video(url='myurl')
		playlist = Utility.create_playlist()
		PlaylistVideo.objects.add_video_to_playlist(video, playlist)
		PlaylistVideo.objects.add_video_to_playlist(video, playlist)
		self.assertEqual(PlaylistVideo.objects.count(), 1, msg='playlist video count is not 1, it is ' + str(PlaylistVideo.objects.count()))
		self.assertEqual(len(PlaylistVideo.objects.get_all_videos_for_playlist(playlist)), 1, msg='videos count in playlist is not 1, it is ' + str(len(PlaylistVideo.objects.get_all_videos_for_playlist(playlist))))
		
	def test_add_same_video_twice_to_different_playlist(self):
		video = Utility.create_video(url='url1')
		playlist1 = Utility.create_playlist(playlist_name='playlist1')
		playlist2 = Utility.create_playlist(playlist_name='playlist2')
		PlaylistVideo.objects.add_video_to_playlist(video, playlist1)
		PlaylistVideo.objects.add_video_to_playlist(video, playlist2)
		self.assertEqual(PlaylistVideo.objects.count(), 2, msg='playlist video count is not 2, it is ' + str(PlaylistVideo.objects.count()))
		self.assertEqual(len(PlaylistVideo.objects.get_all_videos_for_playlist(playlist1)), 1, msg='videos count in playlist1 is not 1, it is ' + str(len(PlaylistVideo.objects.get_all_videos_for_playlist(playlist1))))
		self.assertEqual(len(PlaylistVideo.objects.get_all_videos_for_playlist(playlist2)), 1, msg='videos count in playlist2 is not 1, it is ' + str(len(PlaylistVideo.objects.get_all_videos_for_playlist(playlist2))))