from common import *
import os

DEBUG = True
TEMPLATE_DEBUG = DEBUG

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'vlists',                      # Or path to database file if using sqlite3.
        'USER': 'admin5qem9d8',                      # Not used with sqlite3.
        'PASSWORD': 'aV9KG3iJzeRQ',                  # Not used with sqlite3.
        'HOST': os.environ['OPENSHIFT_POSTGRESQL_DB_HOST'],                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': os.environ['OPENSHIFT_POSTGRESQL_DB_PORT'],                      # Set to empty string for default. Not used with sqlite3.
    }
}

PROJECT_PATH = os.path.realpath(os.path.dirname(__file__))

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
	'templates',
	# PROJECT_PATH + '/templates/',
)

INSTALLED_APPS += (
	'social_auth',
)

AUTHENTICATION_BACKENDS = (
    'social_auth.backends.twitter.TwitterBackend',
	'social_auth.backends.facebook.FacebookBackend',
	'social_auth.backends.google.GoogleOAuthBackend',
	'social_auth.backends.google.GoogleBackend',
	'social_auth.backends.google.GoogleOAuth2Backend',
 	'django.contrib.auth.backends.ModelBackend',
)

TWITTER_CONSUMER_KEY         = 'QmTbePCAKZByVozx4rxFgA'
TWITTER_CONSUMER_SECRET      = '7qwRkjbPKHM0A1ig0yGRfEU0z4OTM0IjcXEwwn7YR0'
FACEBOOK_APP_ID              = '370366216350310'
FACEBOOK_API_SECRET          = '9137179d361260ef9ef38d50decf4fef'
FACEBOOK_EXTENDED_PERMISSIONS = ['email']
FACEBOOK_PROFILE_EXTRA_PARAMS = {'locale': 'ru_RU'}
GOOGLE_OAUTH2_CLIENT_ID 	 = '26917790906.apps.googleusercontent.com'
GOOGLE_OAUTH2_CLIENT_SECRET  = 'Y4CmhQK7OhHoZ3N1N5mJz-qE'

SOCIAL_AUTH_CREATE_USERS          = True
SOCIAL_AUTH_COMPLETE_URL_NAME  = 'socialauth_complete'

#LOGIN_URL          = '/login-form/'
LOGIN_REDIRECT_URL = '/'
LOGIN_ERROR_URL    = '/login/error/'

TEMPLATE_CONTEXT_PROCESSORS = (
    'social_auth.context_processors.social_auth_by_name_backends',
	'social_auth.context_processors.social_auth_backends',
)

SOCIAL_AUTH_PIPELINE = (
    'social_auth.backends.pipeline.social.social_auth_user',
    'social_auth.backends.pipeline.associate.associate_by_email',
    'social_auth.backends.pipeline.user.get_username',
    'social_auth.backends.pipeline.user.create_user',
    'social_auth.backends.pipeline.social.associate_user',
    'social_auth.backends.pipeline.social.load_extra_data',
    'social_auth.backends.pipeline.user.update_user_details'
)
