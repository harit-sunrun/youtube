// loading search page
$(function(){
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
		// alert('hi');

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
					console.log(data)
					search_data = {
						'id': data.id,
						'title': data.title,
						'views': data.viewCount,
						'thumbnail': data.thumbnail['sqDefault'],
					}
					video_result_template(search_data);
				});
			} else {
				var template = $('#item').clone();
                $('#result').html(template);
			}
		  },
		  error: function(xhr, textStatus, errorThrown) {
		    //called when there is an error
		  }
		});
		
	});
});

function video_result_template(data) {
	var item = $('#item').clone();
	item.find('img').attr('src', data.thumbnail);
    item.find('.title').html(data.title);
    item.find('.views').html(data.views);
	item.find('#id').attr('id', data.id);
	
	item.removeClass('hide-item');
	item.addClass('view-item');
	$('#result').append(item).fadeIn(); // slow/fast?
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