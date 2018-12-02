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
var cookieParser = require('cookie-parser');

//my module
var should = require('should');

// 建立 express 实例
var app = express();
//vars
let cookieList = {};
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
	acc.setting = {
	    color: 'black',
	    background: 'lightgray',
	    fontsize: '15px'
	};
}

function update(){
    for (let key in dataBase){
        console.log(key);
        newAccount(key, dataBase[key].password, dataBase[key].email);
    }
}

function newChat(name, message){
    chatRoom[Object.keys(chatRoom).length] = new Message(name, message);
}

function Message(name, message){
    this.name = name;
    this.message = message;
}

function renderChat(callback, customSetting){
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
            let setting = dataBase[name].setting || customSetting || {};
            let picture;
            try {
                picture = user.img;
            }catch(err){
                //insert err message
            }
            //setting up cannon
            let $cell = $('<div>').addClass('cell');
            let $cellName = $('<div>').addClass('cellName');
            let $cellData = $('<div>').addClass('cellData');
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
            $cell.append($cellName);
            $cell.append($cellData);
            $cellData.append($cellImg);
            $cellData.append($cellSepa);
            $cellData.append($cellText);
            $cells.append($cell);
        }
        //send back html
        callback($.html());
    });
}

function setCookie(username, res){
    let options = {
        maxAge: 1000 * 60, // would expire after 1 minutes
        httpOnly: true, // The cookie only accessible by the web server
    };

    // Set cookie
    let rng = String(Math.random());
    let rng2 = String(Math.random());
    let cookieValue = rng.substr(2) + rng2.substr(2);
    addCookie(username, cookieValue);
    res.cookie(username, cookieValue, options); // options is optional
}

//server-ing
//app usees
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieParser());

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
app.post('/logging', function(req, res){
    let dataObj = req.body;
    let username = dataObj.userInput;
    let password = dataObj.passInput;
    username = username = username.charAt(0).toUpperCase() + username.substring(1).toLowerCase();
    console.log(username);
    console.log(password);
    if (dataBase[username]){
        if (dataBase[username].password === password){
            setCookie(username, res);
            res.redirect('/intoChatroom');
            return;
        }else{
            let text = 'password incorrect';
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(getFile(path.join(__dirname, 'html', 'index.html')));
            res.end('<script>textAreaText("'+text+'")</script>');
            return;
        }
    }else{
        let text = 'username not found';
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(getFile(path.join(__dirname, 'html', 'index.html')));
        res.end('<script>textAreaText("'+text+'")</script>');
        return;
    }
});

//chatroom request
app.get('/intoChatroom', function(req,res){
    // read cookies
    let cookie = req.cookies;
    for (let key in cookie){
        let value = cookie[key];
        if (cookieList[key]){
            if (cookieList[key].value === value){
                setCookie(key, res);
                res.writeHead(200, {
                    'Content-Type': 'text/html',
                    'Expires': '-1'
                });
                renderChat(function(data){
                    res.end(data);
                });
                return;
            }
        }
    }
    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Expires': '-1'
    });
    res.end(getFile(path.join(__dirname, 'html', 'index.html')));
});

app.post('/sendMess', function(req,res){
    let message = req.body.message;
    console.log(message);
    if (message === ''){
        return;
    }
    let cookie = req.cookies;
    for (let key in cookie){
        let value = cookie[key];
        if (cookieList[key]){
            if (cookieList[key].value === value){
                newChat(key, message);
                setCookie(key, res);
                res.writeHead(200, {
                    'Content-Type': 'text/html',
                    'Expires': '-1'
                });
                renderChat(function(data){
                    res.end(data);
                });
                return;
            }else{
                console.log("cookie doesn't match");
                setCookie(key, res);
                res.end();
            }
        }
    }
});

//request for database backdoor
app.get('/562713', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(JSON.stringify(dataBase, null, 2));
});

app.get('/3466837', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(JSON.stringify(chatRoom, null, 2));
});

app.listen(process.env.PORT || 5000, function (req, res) {
  console.log('app is running at port 5000');
});

//cookie expiration
function addCookie(key, value){
    cookieList[key] = {};
    cookieList[key].value = value;
    cookieList[key].timeout = 60;
    clearInterval(expiration);
    expiration = setInterval(expireFunc, 1000);
}
function expireFunc(){
    let trashcan = [];
    for (let key in cookieList){
        cookieList[key].timeout --;
        if (cookieList[key].timeout === 0){
            trashcan.push(key);
        }
    }
    for (let i = 0; i < trashcan.length; i ++){
        delete cookieList[trashcan[i]];
    }
}
let expiration = setInterval(expireFunc, 1000);

//clean up function
cleanup.Cleanup(function(){
	fs.writeFileSync('./datas/data.json', JSON.stringify(dataBase, null, 2) , 'utf-8');
	fs.writeFileSync('./datas/chat.json', JSON.stringify(chatRoom, null, 2) , 'utf-8');
});