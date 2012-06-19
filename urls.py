from django.conf.urls import patterns, include, url
from apps.accounts.views import home, done

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'vlists.views.home', name='home'),
    # url(r'^vlists/', include('vlists.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
	url(r'^$', home, name='home'),
	url(r'^done$', done, name='done'),
	url(r'', include('social_auth.urls')),
)
