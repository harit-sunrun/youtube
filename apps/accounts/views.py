from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers

from social_auth import __version__ as version
from vlists.apps.playlists.models import UserPlaylist
from vlists.apps.playlists.models import PlaylistVideo
from vlists.apps.videos.models import Video

import logging

logging.getLogger().setLevel(logging.INFO)
GUEST_USER = 'guest!'

def home(request):
	"""Home view, displays login mechanism"""
	if request.user.is_authenticated():
		return HttpResponseRedirect('done')
	else:
		return render_to_response('index.html', {'version': version},
			RequestContext(request))

# @login_required()
def done(request):
	"""Login complete view, displays user data"""
	ctx = {
		'version': version,
		'last_login': request.session.get('social_auth_last_login_backend')
	}
	vlist_user = GUEST_USER
	if request.user.is_authenticated():
		vlist_user = request.user
	response = render_to_response('home.html', ctx, RequestContext(request))
	response.set_cookie('vlist_user', vlist_user)
	return response
#	return render_to_response('home.html', ctx, RequestContext(request))


@csrf_exempt
@login_required()
@transaction.commit_on_success
def addVideo(request):
	"""
	adds video to user playlist
	"""
	user = request.user
	playlist_name = request.POST['playlist_name']
	url = request.POST['url']
	video_title = request.POST['video_title']
	thumbnail = request.POST['thumbnail']

	logging.info('add Video request for user=%s,  playlist=%s, url=%s' % (user, playlist_name, url))
	# get user playlist with name
	playlist = UserPlaylist.objects.get_or_create_playlist_for_user(user, playlist_name)

	# get video
	video = Video.objects.get_or_create_video(title=video_title, url=url, thumbnail=thumbnail)

	# add video to playlist
	PlaylistVideo.objects.add_video_to_playlist(video, playlist) # returns the video

	return render_to_response('home.html', 'added!')


@csrf_exempt
@login_required
def get_playlists_for_user(request):
	"""
	gets all playlists for user
	"""
	logging.info('getting playlist for user - ' + str(request.user))
	playlists = UserPlaylist.objects.get_all_playlists_for_user(request.user)
	logging.info('user=%s, playlists=%s' % (request.user, playlists))
	return render_to_response('playlists.html', {'playlists': playlists})


@csrf_exempt
@login_required
def get_videos_for_playlist(request):
	"""
	given a user playlist name return all videos added in that playlist
	"""
	videos = get_videos(request)
	logging.info('returning videos: user=%s, playlist=%s, videos=%s' % (request.user, request.POST['playlist'], videos))
	return render_to_response('videos.html', {'videos': videos})


@csrf_exempt
def queue_videos_for_playlist(request):
	"""
	returns videos as list for queueing
	"""
	videos = get_videos(request)
	json = serializers.serialize("json", videos)
	return HttpResponse(json, mimetype="application/json")


def get_videos(request):
	playlist_name = request.POST['playlist']
	playlist = UserPlaylist.objects.get_playlist_for_user_with_name(request.user, playlist_name)
	videos = PlaylistVideo.objects.get_all_videos_for_playlist(playlist)
	return videos
