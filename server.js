var path = require('path');
var fs = require('fs');
var express = require('express');
var redis = require('redis');
var reddb = redis.createClient(6379,"localhost");

// Server part
var app = express();
app.use('/', express.static(path.join(__dirname, 'public')));

var server = app.listen(5000);
console.log('Server listening on port 5000');

// Socket.IO part
var io = require('socket.io')(server);
var start = false;

var sendComments = function (socket) {
    if (start == false)
    {
        fs.readFile('_comments.json', 'utf8', function(err, comments) {
            console.log('_comments',comments,typeof(comments));
            reddb.set("chat",comments,function(err,reply){
                comments = JSON.parse(comments);
                socket.emit('comments',comments);
                start = true;
            });
        });
    }else{
        reddb.get("chat",function(err,reply){
            reply = JSON.parse(reply);
            socket.emit('comments',reply);
        });
        
    }
};

io.on('connection', function (socket) {
    console.log('New client connected!');

    socket.on('fetchComments', function () {
        sendComments(socket);
    });

    socket.on('newComment', function (comment, callback) {
        reddb.get("chat",function(err,reply){
            console.log('get chat reply :',reply)
            reply = JSON.parse(reply)
            console.log('get chat :',reply.toString(),typeof(reply));
            reply.push(comment);
            _reply = JSON.stringify(reply)
            reddb.set("chat",_reply, function (err,setreply){
                io.emit('comments',reply);
                callback(err);
            });
        });
    });
});


reddb.on("error", function(err){
        console.log("Error: " + err);
});
reddb.on("connect", function(){
    //start server();
    reddb.set("name_key", "hello world", function(err,reply){
        console.log(reply.toString());
    });

    reddb.get("name_key", function(err, reply){
        console.log("reply : ",reply.toString());
    });
});

