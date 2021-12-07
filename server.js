var app = require('express')();
var http = require('http').createServer(app);

var io = require('socket.io')(http);

var players = 0;

io.on('connection', (socket) => {
    players++;

    console.log('a user connected');

    socket.join('room1');

    if (players > 1) {
        console.log(players + " Players!");
        socket.broadcast.to(socket).emit('changePlayer');
    }

    socket.on('message', (msg) => {
        console.log(msg);
        socket.broadcast.emit('message-broadcast', msg);
    });
    socket.on('position', (position) => {
        socket.broadcast.emit('position-broadcast', position);
    });
    socket.on('changePlayer', () => {
        socket.broadcast.to(socket).emit('changePlayer');
    });
    socket.on('newGame', () => {
        socket.broadcast.to("room1").emit('newGame');
    });
    socket.on('disconnect', () => {
        players--;
        console.log('user disconnected');
    });
});

app.get('/', (req, res) => res.send('hello!'));
http.listen(3000, () => {
    console.log('listening on *:3000');
});