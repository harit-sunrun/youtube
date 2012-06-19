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
	
	$('.pagination').hide('')
});