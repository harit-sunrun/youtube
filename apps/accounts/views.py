from django.http import HttpResponseRedirect
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect
from django.contrib.messages.api import get_messages
from social_auth import __version__ as version

import logging

def home(request):
    """Home view, displays login mechanism"""
    if request.user.is_authenticated():
        return HttpResponseRedirect('done')
    else:
        return render_to_response('index.html', {'version': version},
                                  RequestContext(request))

@login_required
def done(request):
	"""Login complete view, displays user data"""
	ctx = {
		'version': version,
		'last_login': request.session.get('social_auth_last_login_backend')
	}
	logging.warn('context - ' + str(ctx))
	logging.warn('request - ' + str(request))
	logging.warn('user - ' + str(request.user))
	return render_to_response('home.html', ctx, RequestContext(request))