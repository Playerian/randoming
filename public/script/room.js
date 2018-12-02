/*global $*/
$(window).on('load', function(){
    scroll();
});

function scroll(){
    let element = document.getElementById("cells");
    element.scrollTop = element.scrollHeight;
}

setInterval(function(){
    $.get("intoChatroom", function(data){
        let scrolling = false;
        let $cells = $('#cells');
        if($cells.scrollTop() + $cells.innerHeight() >= $cells[0].scrollHeight) {
            scrolling = true;
        }else{
            scrolling = false;
        }
        let $page = $($.parseHTML(data));
        $('.cells').html($page.find('.cells').html());
        if (scrolling){
            scroll();
        }
    });
}, 1000);