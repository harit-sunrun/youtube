from django.http import HttpResponseRedirect
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect
from django.contrib.messages.api import get_messages
from social_auth import __version__ as version
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt

from vlists.apps.playlists.models import UserPlaylist
from vlists.apps.playlists.models import PlaylistVideo
from vlists.apps.videos.models import Video

import logging
logging.getLogger().setLevel(logging.INFO)

def home(request):
    """Home view, displays login mechanism"""
    if request.user.is_authenticated():
        return HttpResponseRedirect('done')
    else:
        return render_to_response('index.html', {'version': version},
                                  RequestContext(request))

@login_required()
def done(request):
	"""Login complete view, displays user data"""
	ctx = {
		'version': version,
		'last_login': request.session.get('social_auth_last_login_backend')
	}
	logging.warn('context - ' + str(ctx))
	# logging.warn('request - ' + str(request))
	# logging.warn('class - ' + str(request.user.__class__))
	logging.warn('user - ' + str(dir(request.user)))
	return render_to_response('home.html', ctx, RequestContext(request))

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
	
	logging.info('add Video request for user=%s,  playlist=%s, url=%s' % (user, playlist_name, url))
	# get user playlist with name
	playlist = UserPlaylist.objects.get_or_create_playlist_for_user(user, playlist_name)
	
	# get video
	video = Video.objects.get_or_create_video(title=video_title, url=url)
	
	# add video to playlist
	PlaylistVideo.objects.add_video_to_playlist(video, playlist) # returns the video

	return render_to_response('home.html', 'added!')