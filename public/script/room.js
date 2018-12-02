/*global $*/
$(window).on('load', function(){
    let $target = $('.cells'); 
    $target.animate({scrollTop: $target.height()}, 0);
});

setInterval(function(){
    $.get("intoChatroom");
}, 1000);