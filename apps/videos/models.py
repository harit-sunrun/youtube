from django.db import models

import logging
logging.getLogger().setLevel(logging.INFO)

class VideoManager(models.Manager):	
	def get_video(self, url):
		return super(VideoManager, self).get_query_set().filter(url=url)
	
	"""
	- gets/creates a video
	"""
	def get_or_create_video(self, title, url, thumbnail):
		video = self.get_video(url)
		if not video:
			video = Video(title=title, url=url, thumbnail=thumbnail)
			video.save()
			logging.info('video added - ' + repr(video))
		else:
			video = video[0]
			logging.info('video already added - ' + repr(video))
		return video
		
class Video(models.Model):
	title = models.CharField(max_length=100)
	url = models.URLField(max_length=200)
	thumbnail = models.URLField()
	date_created = models.DateTimeField(auto_now_add=True)
	date_modified = models.DateTimeField(auto_now=True)	
	objects = VideoManager() # is a customer manager
	
	def __repr__(self):
		return '<Video id:%s, title:%s, url:%s>'%(self.id, self.title, self.url)
		
	class Meta:
		db_table = 'videos'