/*global $*/
$(window).on('load', function(){
    scroll();
});

function scroll(){
    let element = document.getElementById("cells");
    element.scrollTop = element.scrollHeight;
}

$('#inputSubmit').submit(function(event){
    $('#input').val('');
});

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
        let $cell = $page.find('.cell');
        console.log($($cell[$cell.length - 1]).find('.cellText').text());
        $('.cells').html($page.find('.cells').html());
        if (scrolling){
            scroll();
        }
    });
}, 1000);