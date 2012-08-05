from django.conf.urls import patterns, include, url
from apps.accounts.views import home, done, addVideo

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
	url(r'^$', home),
	url(r'^done$', done, name='done'),
	url(r'', include('social_auth.urls')),
	url(r'^addVideo$', addVideo)
)
	
"""
addVideo
removeVideo
removePlaylist
"""
