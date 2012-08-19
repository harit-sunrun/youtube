// loading search page
$(function () {
  $("#search").click(function() {
    $("#feature").load("templates/search.html", function() {
        $("#search-input").focus();
        $("#search-input").css({
			"margin-left": "20%",
			"margin-top" : "2%"
		});
    });
 });
});

/*
finding youtube videos
API source : https://developers.google.com/youtube/2.0/developers_guide_jsonc
*/
$(function(){
	$('#search-input').live('keyup',function() {
		var search_input = $(this).val();
		var keyword = encodeURIComponent(search_input);
		var yt_url = 'http://gdata.youtube.com/feeds/api/videos?q='+keyword+'&format=5&max-results=10&v=2&alt=jsonc';

		$.ajax({
		  url: yt_url,
		  type: 'GET',
		  dataType: 'jsonp',
		  complete: function(xhr, textStatus) {
		    //called when complete
		  },
		  success: function(response, textStatus, xhr) {
			if(response.data.items) {
				var template = $('#item').clone();
                $('#result').html(template);
				$.each(response.data.items, function(i, data) {
					//console.log(data)
					var search_data = {
						'id': data.id,
						'title': data.title,
						'views': data.viewCount,
						'thumbnail': data.thumbnail['sqDefault']
					}
					item = video_result_template(search_data);
					$('#result').append(item).fadeIn('slow');
				});
			} else {

			}
		  },
		  error: function(xhr, textStatus, errorThrown) {
		    //called when there is an error
		  }
		});
	});
});

// filling out the search template
function video_result_template(data) {
	var item = $('#item').clone();
	item.removeClass('hide-item');
	item.find('img').attr('src', data.thumbnail);
    item.find('.title').html(data.title);
    item.find('.views').html(data.views);
	item.attr('id', data.id);
	item.addClass('view-item');
	return item;
}

// playing the video from search result on player pane
$(function(){
	$('.item').live('click', function(){
		// alert(this.id);
        play_video(this.id);
	});
});

// playing video in left pane
function play_video(id) {
    var url = $('#video-frame').attr('src');
    var new_url = url.replace(/embed\/[\w -]*/g, 'embed/' + id);
    $('#video-frame').attr('src', new_url);
}

// setting up ajaxSetup
$.ajaxSetup({
     beforeSend: function(xhr, settings) {
         function getCookie(name) {
             var cookieValue = null;
             if (document.cookie && document.cookie != '') {
                 var cookies = document.cookie.split(';');
                 for (var i = 0; i < cookies.length; i++) {
                     var cookie = jQuery.trim(cookies[i]);
                     // Does this cookie string begin with the name we want?
                 if (cookie.substring(0, name.length + 1) == (name + '=')) {
                     cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                     break;
                 }
             }
         }
         return cookieValue;
         }
         if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
             // Only send the token to relative URLs i.e. locally.
             xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
         }
     }
});

// creating new playlist
$(function() {
    // activate "New" buttons if input is not empty
    $('form input[type="text"]').live('keyup', function() {
        var val = $.trim(this.value);
        $(this).next("button").prop('disabled', val.length === 0);
    });

    $("body").on("submit","form",function(e){
        // do not submit the form
        e.preventDefault();

        // handle everything yourself
        var $form = $(this);
        var item = $form.closest('.item');
        var title = item.find('.title').text();
        var id = $form.closest('.item').attr('id');
		var thumbnail = $form.closest('.item').find('.thumbnail').attr('src');
        var playlist = $form.find('.input-small').val();

        // send the data to the server using .ajax() or .post()
		$.ajax({
			type: 'POST',
			url: 'addVideo',
			data: {
				video_title: title,
				playlist_name: playlist,
				url: id,
				thumbnail: thumbnail
				// csrfmiddlewaretoken: '{{ csrf_token }}',
			},
			success: function(response, textStatus, jqXHR){
				 bootstrap_alert.success('video saved successfully');
			},

			// callback handler that will be called on error
      		error: function(jqXHR, textStatus, errorThrown){
				bootstrap_alert.error('There were some errors while saving the video. Please try in a while');
			}
		});
    });
});

// setting up alerts on action
bootstrap_alert = function() {}
bootstrap_alert.success = function(message) {
  	var div = $('<div id="alert" class="alert alert-success"><!--a class="close" data-dismiss="alert">×</a--><span>'+message+'</span></div>');
  	$('#feature').prepend(div);
  	div.slideDown(500).delay(2000).slideUp(500);
}
bootstrap_alert.error = function(message) {
	var div = $('<div id="alert" class="alert alert-error"><!--a class="close" data-dismiss="alert">×</a--><span>'+message+'</span></div>');
  	$('#feature').prepend(div);
  	div.slideDown(500).delay(2000).slideUp(500);
}

// getting playlists for user
$(function(){
	$('#playlist').click(function(){
		$.ajax({
			url: '/getUserPlaylists',
            cache: false,
			success: function(response, textStatus, jqXHR){
				// console.log(response);
				$('#feature').empty().append(response);
			},
			error: function(response, textStatus, jqXHR) {
				bootstrap_alert.error('error in receving playlists');
			}
		});
	});
});

// getting videos for playlists
$(function(){
	$('body').on('click', '.playlist', function(event) {
		var div = $(this);
		var playlist = div.attr('id');
		// alert('getting the videos for ' + playlist);
		$.ajax({
		  url: '/getVideos',
		  type: 'POST',
		  data: {'playlist': playlist},
		  complete: function(xhr, textStatus) {
		    //called when complete
		  },
		  success: function(response, textStatus, jqXHR) {
		    // console.log(response);
			$('#feature').empty().append(response);
		  },
		  error: function(response, textStatus, jqXHR) {
		    bootstrap_alert.error('There were some errors while getting your videos, please try in a while');
		  }
		});
	});
});

// queue all playlist videos
$(function(){
	$('body').on('click', '.queueAll', function(e) {
		var playlist = $(this).closest('.playlist').attr('id');
		e.stopPropagation();
		$.ajax({
		  url: '/queuePlaylistVideos',
		  type: 'POST',
		  data: {'playlist': playlist},
		  complete: function(xhr, textStatus) {
		    //called when complete
		  },
		  success: function(data, textStatus, xhr) {
			for (var i = 0; i < data.length; i++) {
				// console.log(data[i].fields['title']);
				addToQueue(data[i].fields['title'], data[i].fields['url'], data[i].fields['thumbnail']);
			}
			bootstrap_alert.success('queued all videos');
		  },
		  error: function(xhr, textStatus, errorThrown) {
		    bootstrap_alert.error('Error while queueing the videos, please try in a while');
		  }
		});

	});
});

// adding to localStorage
function addToQueue(title, url, thumbnail) {
	var video = {'title': title, 'url': url, 'thumbnail': thumbnail};
	var queue = [];
	if (localStorage['queue'] != null) {
		queue = JSON.parse(localStorage['queue']);
	}
	queue.push(video);
	localStorage['queue'] = JSON.stringify(queue);
	console.log(localStorage.getItem('queue'));
}

// queue-ing videos from playlist
$(function(){
	$('body').on('click', '.video', function(event) {
		var title = $(this).children('.title').text();
		var url = $(this).children('.url').text();
		var thumbnail = $(this).find('img').attr('src');
		addToQueue(title, url, thumbnail);
	 	bootstrap_alert.success('queued!');
	});
});

// queue-ing videos from search page
$(function(){
    $('body').on('click', '.queue_search_video', function(e){
        var item = $(this).closest('.item');
        var title = item.find('.title').text();
        var url = item.attr('id');
        var thumbnail = item.find('img').attr('src');
        console.log(title + "," + url + "," + thumbnail);
        addToQueue(title, url, thumbnail);
        bootstrap_alert.success('queued!');
        e.stopPropagation();
    });
});

// loading queue page
$(function(){
    $('#queue').click(function(){
        $("#feature").load("templates/queue.html", function(){
            if (localStorage['queue'] == null) {
                $('.queue_list').append('<p>You have not added any video to the queue yet</p>');
            } else {
                var queue_list = JSON.parse(localStorage['queue']);
                for (var i = 0; i < queue_list.length; i ++) {
                    console.log(queue_list[i]);
                    var item = fill_queue_item(queue_list[i]);
                    $('.queue_list').append(item).fadeIn('slow');
                }
            }
        });
    });

    $('body').on('click', '#play', function(){
        bootstrap_alert.success('will play video now');
    });

    $('body').on('click', '#previous', function(){
        bootstrap_alert.success('will play previous video now');
    });

    $('body').on('click', '#next', function(){
        bootstrap_alert.success('will play next video now');
    });

    $('body').on('click', '#shuffle', function(){
        bootstrap_alert.success('will shuffle videos now');
    });

    // clicking on any video in queue start playing the video in left pane
    $('body').on('click', '.queue_item', function(){
        play_video(this.id);
    });
});

// filling up queue item
function fill_queue_item(data) {
    var template = $('.queue_item').first().clone();
    template.removeClass('hide-item');
    template.find('img').attr('src', data.thumbnail);
    template.find('.title').html(data.title);
    template.attr('id', data.url);
    template.addClass('view-item');
    return template;
}

// animating slideshow on landing page
$(function(){
	$('#slides').slides({
		preload: true,
		pagination: true,
		preloadImage: '../static/img/loading.gif',
		play: 2000,
		pause: 1000,
		hoverPause: true
	});

	$('.slides_control').css({
		"height": "600px",
		"margin-right": "400px"
	});

	$('.pagination').hide('');
});
