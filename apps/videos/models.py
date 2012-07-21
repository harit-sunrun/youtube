from django.db import models

import logging

class VideoManager(models.Manager):	
	def get_video(self, url):
		return super(VideoManager, self).get_query_set().filter(url=url)
	
	"""
	- gets/creates a video
	"""
	def get_or_create_video(self, title, url):
		video = self.get_video(url)
		if not video:
			video = Video(title=title, url=url)
			logging.info('adding video title - ' + title + ', url - ' + url)
			video.save()
		return video
		
class Video(models.Model):
	title = models.CharField(max_length=100)
	url = models.URLField(max_length=200)
	date_created = models.DateTimeField(auto_now_add=True)
	date_modified = models.DateTimeField(auto_now=True)	
	objects = VideoManager() # is a customer manager
	
	def __repr__(self):
		return '<Video id:%s, title:%s, url:%s>'%(self.id, self.title, self.url)
		
	class Meta:
		db_table = 'videos'