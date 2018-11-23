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

//my module
var should = require('should');

// 建立 express 实例
var app = express();
let people = 0;

//database
let dataBase = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
console.log(dataBase);
//function-ing
function getFile(path){
	return fs.readFileSync(path);
}
//contructor-ing
function newAccount(name, password){
	dataBase[name] = {};
	let acc = dataBase[name];
	acc.password = password;
	acc.title = "";
}

//server-ing
//app use
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true })); 

//getting
app.all('/', function(req, res){
    console.log("=======================================");
    console.log("请求路径："+req.url);
    var filename = req.url.split('/')[req.url.split('/').length-1];
    var suffix = req.url.split('.')[req.url.split('.').length-1];
    console.log("文件名：", filename);
    if(req.url==='/'){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(getFile(path.join(__dirname, 'html', 'index.html')));
    }else if(suffix==='css'){
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.end(getFile(path.join(__dirname, 'public', 'css', filename)));
    }else if (suffix === 'js'){
    	res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.end(getFile(path.join(__dirname, 'public', 'javascript', filename)));
    }else if(suffix in ['gif', 'jpeg', 'jpg', 'png']) {
        res.writeHead(200, {'Content-Type': 'image/'+suffix});
        res.end(getFile(path.join(__dirname, 'public', 'images', filename)));
    }
});
//when registering

//when getting login stuff
app.post('/login', function(req, res) {
  console.log(req.body);
  let dataObj = req.body;
  console.log(dataBase);
  let length = Object.keys(dataBase).length;
  dataBase.name = dataObj.userInput;
  dataBase.password = dataObj.passInput;
});

app.listen(process.env.PORT || 5000, function (req, res) {
  console.log('app is running at port 5000');
});

//clean up function
cleanup.Cleanup(function(){
	fs.writeFileSync('./data.json', JSON.stringify(dataBase, null, 2) , 'utf-8');
});