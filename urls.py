from django.conf.urls import patterns, include, url
from apps.accounts.views import home, done, addVideo, get_playlists_for_user, get_videos_for_playlist, queue_videos_for_playlist

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
	url(r'^$', home),
	url(r'^done$', done, name='done'),
	url(r'', include('social_auth.urls')),
	url(r'^addVideo$', addVideo),
	url(r'^getUserPlaylists', get_playlists_for_user),
	url(r'^getVideos', get_videos_for_playlist),
	url(r'^queuePlaylistVideos', queue_videos_for_playlist)
)
