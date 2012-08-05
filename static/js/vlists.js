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
					search_data = {
						'id': data.id,
						'title': data.title,
						'views': data.viewCount,
						'thumbnail': data.thumbnail['sqDefault'],
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
		var url = $('#video-frame').attr('src');
		var new_url = url.replace(/embed\/[\w -]*/g, 'embed/' + this.id);
		$('#video-frame').attr('src', new_url);
	});
});

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
        var title = $form.closest('.video-detail').find('.title').text();
        var id = $form.closest('.item').attr('id');
        var playlist = $form.find('.input-small').val();
        console.debug(title);
        console.debug(playlist);
		console.debug(id);

        // send the data to the server using .ajax() or .post()
		$.ajax({
			type: 'POST',
			url: 'addVideo',
			data: {
				video_title: title,
				playlist_name: playlist,
				url: id
				// csrfmiddlewaretoken: '{{ csrf_token }}'
				},
		}).done(function(){
			alert('done');
		});
    });
});

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