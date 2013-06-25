/* global variables */
var guest_user = "guest!";
var cookie_user = "vlist_user";
var youtube_player; // global player variable
var video_index = 0; //current video index
var current_video_queue = []; // will hold current active queue
var repeat = 0; // 0: no-repeat, 1: repeat-all, 2: repeat-one

// middle-navigation buttons
$(function () {
    $('#search').click(function () {
        show_page('search');
        tidy_search_box();
    });

    $('#playlist').click(function () {
        show_playlists();
        // show_page('playlists'); // moved to above function
    });

    $('#settings').click(function () {
        show_settings();
        // show_page('settings'); // moved to above function
    });

    $('#queue').click(function () {
        show_queue();
        show_page('queue');
    });

    // some extra things
    // 1. always focus on search box
    tidy_search_box()

    // 2. clear the current queue
    $('#clear_queue').click(function () {
        localStorage.removeItem('queue');
        $('.queue_list .view-item').remove();
        reset_current_video_queue();
        reset_video_index();
        bootstrap_alert.success("queue cleared.");
    });
});

// which page to show based on page
function show_page(page) {
    $('#search_page').hide();
    $('#playlist_page').hide();
    $('#setting_page').hide();
    $('#queue_page').hide();
    if (page == 'search') {
        $('#search_page').show();
    }
    else if (page == 'playlists') {
        $('#playlist_page').show();
    }
    else if (page == 'settings') {
        $('#setting_page').show();
    }
    else if (page == 'queue') {
        $('#queue_page').show();
    }

}

// click to playlists calls this
function show_playlists() {
    // Check if the user is authenticated
    var user = $.cookie(cookie_user);
    if (user == guest_user) {
        ask_user_to_sign_in();
    } else {
        $.ajax({
            url:'/getUserPlaylists',
            cache:false,
            success:function (response) {
                $('#playlist_page').empty().append(response);
            },
            error:function () {
                bootstrap_alert.error('error in receiving playlists');
            }
        });
        show_page('playlists');
    }
}

// click on settings calls this
function show_settings() {
    var user = $.cookie(cookie_user);
    if (user == guest_user) {
        ask_user_to_sign_in();
    } else {
        show_page('settings');
    }
}

// click on queue calls this
function show_queue() {
    if (localStorage['queue'] == null) {
        $('.queue_list').empty();
        $('.queue_list').append('<p>You have not added any video to the queue yet</p>');
    } else {
        var queue_list = JSON.parse(localStorage['queue']);
        var items_displayed = $('.queue_list .view-item').length;
        if (items_displayed == queue_list.length) {
            return;
        }

        // remove already displayed queue
        $('.queue_list .view-item').remove();

        // create queue
        for (var i = 0; i < queue_list.length; i++) {
            console.log(queue_list[i]);
            var item = fill_queue_item(queue_list[i]);

            // fill the current playing queue
            current_video_queue.push(queue_list[i].url);
        }
    }
}

// always keeps search-box clean and aligned
function tidy_search_box() {
    $('#search-input').val("");
    $('#search-input').focus();
}

/*
 finding youtube videos
 API source : https://developers.google.com/youtube/2.0/developers_guide_jsonc
 */
$(function () {
    $('#search-input').live('keyup', function () {
        var search_input = $(this).val();
        var keyword = encodeURIComponent(search_input);
        var yt_url = 'http://gdata.youtube.com/feeds/api/videos?q=' + keyword + '&format=5&max-results=10&v=2&alt=jsonc';

        $.ajax({
            url:yt_url,
            type:'GET',
            dataType:'jsonp',
            complete:function () {
                //called when complete
            },
            success:function (response) {
                if (response.data.items) {
                    var template = $('#item').clone();
                    $('#result').html(template);
                    $.each(response.data.items, function (i, data) {
                        //noinspection JSUnresolvedVariable
                        var search_data = {
                            'id':data.id,
                            'title':data.title,
                            'views':data.viewCount,
                            'thumbnail':data.thumbnail['sqDefault']
                        }
                        var item = video_result_template(search_data);
                        $('#result').append(item).fadeIn('slow');
                    });
                } else {

                }
            },
            error:function () {
                //called when there is an error
            }
        });
    });
});

// filling out the search template based on YouTube search results
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
$(function () {
    $('.item').live('click', function () {
        play_video(this.id);
    });
});

// setting up ajaxSetup
$.ajaxSetup({
    beforeSend:function (xhr, settings) {
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
$(function () {
    // activate "New" buttons if input is not empty
    $('form input[type="text"]').live('keyup', function () {
        var val = $.trim(this.value);
        $(this).next("button").prop('disabled', val.length === 0);
    });

    $("body").on("submit", "form", function (e) {
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
            type:'POST',
            url:'addVideo',
            data:{
                video_title:title,
                playlist_name:playlist,
                url:id,
                thumbnail:thumbnail
                // csrfmiddlewaretoken: '{{ csrf_token }}',
            },
            success:function () {
                bootstrap_alert.success('video saved successfully');
            },

            // callback handler that will be called on error
            error:function () {
                bootstrap_alert.error('There were some errors while saving the video. Please try in a while');
            }
        });
    });
});

// setting up alerts on action
bootstrap_alert = function () {
}
bootstrap_alert.success = function (message) {
    var div = $('<div id="alert" class="alert alert-success"><!--a class="close" data-dismiss="alert">×</a--><span>' + message + '</span></div>');
    $('#feature').prepend(div);
    div.slideDown(500).delay(2000).slideUp(500);
}
bootstrap_alert.error = function (message) {
    var div = $('<div id="alert" class="alert alert-error"><!--a class="close" data-dismiss="alert">×</a--><span>' + message + '</span></div>');
    $('#feature').prepend(div);
    div.slideDown(500).delay(2000).slideUp(500);
}

// getting videos given playlist name
$(function () {
    $('body').on('click', '.playlist', function () {
        var div = $(this);
        var playlist = div.attr('id');
        $.ajax({
            url:'/getVideos',
            type:'POST',
            data:{'playlist':playlist},
            complete:function () {
                //called when complete
            },
            success:function (response) {
                $('#playlist_page').empty().append(response);
            },
            error:function () {
                bootstrap_alert.error('There were some errors while getting your videos, please try in a while');
            }
        });
    });
});

// 'queue all' playlist videos
$(function () {
    $('body').on('click', '.queueAll', function (e) {
        var playlist = $(this).closest('.playlist').attr('id');
        e.stopPropagation();
        $.ajax({
            url:'/queuePlaylistVideos',
            type:'POST',
            data:{'playlist':playlist},
            complete:function () {
            },
            success:function (data) {
                for (var i = 0; i < data.length; i++) {
                    //noinspection JSUnresolvedVariable
                    addToQueue(data[i].fields['title'], data[i].fields['url'], data[i].fields['thumbnail']);
                }
                bootstrap_alert.success('queued all videos');
            },
            error:function () {
                bootstrap_alert.error('Error while queueing the videos, please try in a while');
            }
        });

    });
});

// adding to localStorage
// appends to Queue page
// appends to current queue
function addToQueue(title, url, thumbnail) {
    var video = {'title':title, 'url':url, 'thumbnail':thumbnail};
    var queue = [];
    if (localStorage['queue'] != null) {
        queue = JSON.parse(localStorage['queue']);
    }
    queue.push(video);
    localStorage['queue'] = JSON.stringify(queue);

    // append to Queue page
    fill_queue_item(video);

    // add to current playing Queue
    current_video_queue.push(url);

    console.log(localStorage.getItem('queue'));
}

// filling up queue item
function fill_queue_item(data) {
    var template = $('.queue_item').first().clone();
    template.removeClass('hide-item');
    template.find('img').attr('src', data.thumbnail);
    template.find('.title').html(data.title);
    template.attr('id', data.url);
    template.addClass('view-item');

    // also add to queue page at the same time
    $('.queue_list').append(template).fadeIn('slow');
    return template;
}

// 'queue'-ing videos from playlist
$(function () {
    $('body').on('click', '.video', function () {
        var title = $(this).children('.title').text();
        var url = $(this).children('.url').text();
        var thumbnail = $(this).find('img').attr('src');
        addToQueue(title, url, thumbnail);
        bootstrap_alert.success('queued!');
    });
});

// 'queue'-ing videos from search page
$(function () {
    $('body').on('click', '.queue_search_video', function (e) {
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

// shuffle videos - templates + current video queue
// code courtesy : http://stackoverflow.com/questions/315177/any-way-to-shuffle-content-in-multiple-div-elements
function shuffle(v) {
    var replace = $('<div>');
    var size = v.size();

    // shuffle the playing queue too
    reset_current_video_queue();
    reset_video_index();

    while (size >= 1) {
        var random = Math.floor(Math.random() * size);
        var temp = v.get(random);
        current_video_queue.push(temp.id); // re-order videos in current queue
        replace.append(temp);
        v = v.not(temp);
        size--;
    }
    $('.queue_list').html(replace.html());
}

// animating slide show on landing page
$(function () {
    $('#slides').slides({
        preload:true,
        pagination:true,
        preloadImage:'../static/img/loading.gif',
        play:2000,
        pause:1000,
        hoverPause:true
    });

    $('.slides_control').css({
        "height":"600px",
        "margin-right":"400px"
    });

    $('.pagination').hide('');
});

// adding YouTube controls
$(function () {
    var tag = document.createElement('script');
//    tag.src = "//www.youtube.com/iframe_api";
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

function onYouTubeIframeAPIReady() {
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    youtube_player = new YT.Player('player', {
        height:'390',
        width:'640',
        videoId:'JW5meKfy3fY',
        events:{
            'onReady':onPlayerReady,
            'onStateChange':onPlayerStateChange
        }
    });
}

// playing video in left pane
function play_video(id) {
    //noinspection JSUnresolvedFunction
    if (youtube_player) {
      youtube_player.loadVideoById(id, 0);
    }
}

function onPlayerReady() {
}

// when video is finished playing, what next video to play?
function onPlayerStateChange(event) {
    if (event.data == 0) {
        var id = get_next_video_id();
        if (id == -1) {
            // repeat = 0, reset video_index
            reset_video_index();
        } else {
            play_video(id);
        }
    }
}

// This will do all logic checks for
// repeat-one, repeat-all and will send
// the appropriate video id
function get_next_video_id() {
    if (repeat == 2) {
        // repeat-one
    } else if (repeat == 1) {
        // repeat-all
        increment_video_index();
    } else {
        // check if all videos are played, just stop
        if (video_index == current_video_queue.length - 1) {
            return -1; // all videos played, do not repeat queue
        } else {
            increment_video_index();
        }
    }
    return current_video_queue[video_index];
}

// queue navigator buttons control
$(function () {
    $('body').on('click', '#play', function () {
        play_video(current_video_queue[video_index]); // always play current video
    });

    $('body').on('click', '#previous', function () {
        play_previous();
    });

    $('body').on('click', '#next', function () {
        play_next();
    });

    $('body').on('click', '#shuffle', function () {
        shuffle($('.queue_list .view-item'));
    });

    $('body').on('click', '#repeat', function () {
        toggle_repeat();
    });

    // clicking on any video in queue start playing the video in left pane
    $('body').on('click', '.queue_item', function () {
        // set video_index to be current index
        video_index = $.inArray(this.id, current_video_queue);
        play_video(this.id);
    });
});

function play_next() {
    increment_video_index();
    play_video(current_video_queue[video_index]);
}

function play_previous() {
    decrement_video_index();
    play_video(current_video_queue[video_index]);
}

function toggle_repeat() {
    if (repeat == 2) {
        $('.repeat-badge').hide();
        repeat = 0;
    } else {
        repeat++;
    }
    var color = repeat == 0? "" : "yellow";
    $('.icon-refresh').css("color", color);
    if (repeat == 2) {
        $('.repeat-badge').show();
    }
}



function increment_video_index() {
    if (video_index == current_video_queue.length-1) {
        video_index = 0;
    } else{
        video_index += 1;
    }
}

function decrement_video_index() {
    if (video_index == 0) {
        video_index = current_video_queue.length - 1;
    } else {
        video_index -= 1;
    }
}

function reset_video_index() {
    video_index = 0;
}

function reset_current_video_queue() {
    current_video_queue = [];
}

// If a user is not logged in and try to
// click 'Playlists', 'Settings' or 'Add to Playlists'
// he/she should login first to do that
function ask_user_to_sign_in() {
    $('#sign_in_modal').modal('show');
}

// check is user is logged in while clicking on
// 'Add to Playlist'
$(function(){
    $('body').on('click', '#add_to_playlist', function(){
        var user = $.cookie(cookie_user);
        var form = $(this).next('.dropdown-menu');
        form.hide();
        if (user == guest_user) {
            ask_user_to_sign_in();
        } else {
            form.show();
        }
    });
});
