from django.test import TestCase
from models import Video
import unittest

# Reference: http://stackoverflow.com/questions/2533457/how-to-setup-and-teardown-temporary-django-db-for-unit-testing

URL = 'url'
TITLE = 'title'

"""
The idea is that url will be unique
Following test cases are
test_video_insert() : test that video is entered in database
test_video_insert_is_one_even_tried_to_save_twice(): test that even if we give same url twice, it is saved just once
test_video_insert_with_different_url(): test that different url corresponds to different entries in database
test_video_insert_with_different_title(): test that title has no role in creating new entries in database
"""

class VideoTest(TestCase):		
	def test_video_insert(self):
		self.insert_video()
		self.assertEqual(Video.objects.count(), 1, msg="video count is not 1, it is " + str(Video.objects.count()))
	
	def test_video_insert_is_one_even_tried_to_save_twice(self):
		self.insert_video()
		self.assertEqual(Video.objects.count(), 1, msg="video count is not 1, it is " + str(Video.objects.count()))
		
	def test_video_insert_with_different_url(self):
		self.insert_video()
		self.insert_video()
		self.insert_video(url='url1')
		self.insert_video(url='url2')
		self.assertEqual(Video.objects.count(), 3, msg="video count is not 3, it is " + str(Video.objects.count()))
		
	def test_video_insert_with_different_title(self):
		self.insert_video()
		self.insert_video(title='title1')
		self.insert_video(title='title2')
		self.insert_video(title='title3')
		self.assertEqual(Video.objects.count(), 1, msg="video count is not 1, it is " + str(Video.objects.count()))
				
	def insert_video(self, title=TITLE,url=URL):
		self.video = Video.objects.get_or_create(title=TITLE, url=url)
