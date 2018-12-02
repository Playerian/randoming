/*global $*/
$(".userInput").keypress(function(e){
    var txt = String.fromCharCode(e.which);
    if(!txt.match(/[A-Za-z]/)) 
    {
        return false;
    }
    if ($(this).val().length > 12){
        return false;
    }
});

$('#register').click(function(e){

    let input = $('.userInput').val();
    if (input.length === 0){
        alert('no username');
        return false;
    }else if (input.length < 3){
        alert('username too short');
        return false;
    }else if (input.length > 12){
        alert('username too long');
        return false;
    }
    if (input.match(/[A-Za-z]/g).join('') !==  input){
        alert('Invalid username');
        return false;
    }
});

console.log('script running client side successful!');

function sameUser(username){
    $('#textArea').text("This username: "+username+" has already been taken");
    setTimeout(function(){
        $("#textArea").text("");
    }, 30000);
}

function textAreaText(text){
    $('.textArea').text(text);
    setTimeout(function(){
        $(".textArea").text("");
    }, 30000);
}