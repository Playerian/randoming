// 引入依赖
var express = require('express');
var utility = require('utility');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');
var eventproxy = require('eventproxy');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var cleanup = require('./library/cleanup');
var sanitizer = require('sanitize')();
var nodemailer = require('nodemailer');

//my module
var should = require('should');

// 建立 express 实例
var app = express();
let people = 0;

//database
let dataBase = JSON.parse(fs.readFileSync('./datas/data.json', 'utf8'));
let chatRoom = JSON.parse(fs.readFileSync('./datas/chat.json', 'utf8'));
console.log(dataBase);
console.log(chatRoom);
//function-ing
function getFile(path){
	return fs.readFileSync(path);
}
//contructor-ing
function newAccount(name, password, email){
	dataBase[name] = {};
	let acc = dataBase[name];
	acc.password = password;
	acc.title = "";
	acc.email = email;
	acc.img = '';
}

function newChat(name, message){
    chatRoom[Object.keys(chatRoom).length] = new Message(name, message);
}

function Message(name, message){
    this.name = name;
    this.message = message;
}

function renderChat(){
    fs.readFile('./html/room.html',function(err, data){
        if (err) throw console.log('expected room not found!');
        let $ = cheerio.load(data);
        //clean and swipe
        let $cells = $('.cells');
        $cells.html('');
        //looping
        for (let i = 0; i < Object.keys(chatRoom).length; i ++){
            if (!chatRoom[i]){
                throw 'message not found';
            }
            let name = chatRoom[i].name;
            let message = chatRoom[i].message;
            let user = dataBase[name];
            let picture;
            try {
                picture = user.img;
            }catch(err){
                console.log(err.message);
            }
            //setting up cannon
            let $cell = $('<div>').addClass('cell');
            let $cellName = $('<div>').addClass('cellName');
            let $cellData = $('<div').addClass('cellData');
            let $cellImg = $('<img>').addClass('cellImg');
            let $cellSepa = $('<div>').addClass('cellSepa');
            let $cellText = $('<span>').addClass('cellText');
            //data loading
            $cellText.text(message);
            $cellName.text(name);
            if (picture){
                $cellImg.attr('src', picture);
            }
            //fire!
            $cellData.append($cellImg);
            $cellData.append($cellSepa);
            $cellData.append($cellText);
            $cell.append($cellName);
            $cell.append($cellData);
            $cells.append($cell);
        }
    });
}

//server-ing
//app use
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true })); 

//getting html requests
app.all('/', function(req, res){
    console.log("=======================================");
    console.log("请求路径："+req.url);
    var filename = req.url.split('/')[req.url.split('/').length-1];
    var suffix = req.url.split('.')[req.url.split('.').length-1];
    console.log("文件名：", filename);
    if(req.url==='/'){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(getFile(path.join(__dirname, 'html', 'index.html')));
    }
    else if (suffix==='css'){
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.end(getFile(path.join(__dirname, 'public', 'css', filename)));
    }
    else if (suffix === 'js'){
    	res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.end(getFile(path.join(__dirname, 'public', 'script', filename)));
    }
    else if (suffix in ['gif', 'jpeg', 'jpg', 'png']) {
        res.writeHead(200, {'Content-Type': 'image/'+suffix});
        res.end(getFile(path.join(__dirname, 'public', 'images', filename)));
    }
});
//when getting page request
app.post('/registerPage', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(getFile(path.join(__dirname, 'html', 'register.html')));
});

app.post('/loginPage', function(req, res) {
    let dataObj = req.body;
    let username = dataObj.username;
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(getFile(path.join(__dirname, 'html', 'index.html')));
});
//when getting register request
app.post('/register', function(req, res) {
    console.log(req.body);
    let dataObj = req.body;
    let username = dataObj.userInput;
    let password = dataObj.passInput;
    let email = dataObj.emailInput;
    if (username.length === 0 || username.length < 3 || username.length > 12){
        return;
    }
    if (password.length === 0){
        return;
    }
    username = username.match(/[A-Za-z]/g).join("");
    username = username.charAt(0).toUpperCase() + username.substring(1).toLowerCase();
    if (dataBase[username] !== undefined){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(getFile(path.join(__dirname, 'html', 'register.html')));
        res.end('<script>sameUser("'+username+'")</script>');
        return console.log('username has been used');
    }
    let account = new newAccount(username, password);
    fs.writeFile('./datas/data.json', JSON.stringify(dataBase, null, 2) , 'utf-8', function(err){
        if (err){
            throw console.log('error occurs writing file to database');
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(getFile(path.join(__dirname, 'html', 'successful.html')));
        res.end('<script>setName("'+username+'")</script>');
    });
});
//when getting login request

//chatroom request

//request for database backdoor
app.get('/562713', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(getFile('./datas/data.json'));
});

app.listen(process.env.PORT || 5000, function (req, res) {
  console.log('app is running at port 5000');
});

//clean up function
cleanup.Cleanup(function(){
	fs.writeFileSync('./datas/data.json', JSON.stringify(dataBase, null, 2) , 'utf-8');
	fs.writeFileSync('./datas/chat.json', JSON.stringify(chatRoom, null, 2) , 'utf-8');
});