var app = require('express')();
var http = require('http').createServer(app);

const io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
    }
});

var players = 0;
var currentRoom = 1;

io.on('connection', (socket) => {
    players++;
    console.log('Players in current room: ' + players);

    console.log('a user connected');

    socket.join('room' + currentRoom);
    let room = 'room' + currentRoom;

    if (players === 1) {
        // console.log("Change Player in " + room);
        // socket.to(room).emit('changePlayer');
    } else if (players === 2) {
        socket.to(room).emit('changePlayer');
        players = 0;
        currentRoom++;
        console.log("New Room: " + 'room' + currentRoom);
    }

    socket.on('position', (position) => {
        socket.to(room).emit('position-broadcast', position);
    });
    socket.on('changePlayer', () => {
        io.in(room).emit('changePlayer');
    });
    socket.on('newGame', () => {
        io.in(room).emit('newGame');
    });
    socket.on('disconnect', () => {
        // players--;
        console.log('user disconnected');
    });
});

app.get('/', (req, res) => res.send('hello!'));
http.listen(process.env.PORT || 3000, () => {
    console.log('listening on *:3000');
});