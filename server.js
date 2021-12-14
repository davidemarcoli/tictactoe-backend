var app = require('express')();
var http = require('http').createServer(app);

var io = require('socket.io')(http);

var players = 0;
var currentRoom = 1;

io.on('connection', (socket) => {
    players++;

    console.log('a user connected');

    socket.join('room' + currentRoom);
    let room = 'room' + currentRoom;

    if (players === 2) {
        players = 0;
        currentRoom++;
        socket.to(room).emit('changePlayer');
        console.log("New Room: " + 'room' + currentRoom);
    }

    socket.on('position', (position) => {
        socket.to(room).emit('position-broadcast', position);
    });
    socket.on('changePlayer', () => {
        io.in(room).emit('changePlayer');
        console.log("changePlayer");
    });
    socket.on('newGame', () => {
        io.in(room).emit('newGame');
    });
    socket.on('disconnect', () => {
        players--;
        console.log('user disconnected');
    });
});

app.get('/', (req, res) => res.send('hello!'));
http.listen(process.env.PORT || 3000, () => {
    console.log('listening on *:3000');
});