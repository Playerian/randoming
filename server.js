// 引入依赖
var express = require('express');
var utility = require('utility');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');
var eventproxy = require('eventproxy');
var fs = require('fs');

//my module
var should = require('should');

// 建立 express 实例
var app = express();
let people = 0;

app.get('/', function (req, res){
	fs.readFile('index.html', function(err, data){
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(data);
		people ++;
		res.write(String(people) + " people has visited.");
		res.end();
	});
});

app.listen(process.env.PORT || 5000, function (req, res) {
  console.log('app is running at port 5000');
});