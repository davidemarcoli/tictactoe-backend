var app = require('express')();
var http = require('http').createServer(app);

const io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
    }
});

io.on('connection', (socket) => {

    var room = '';

    socket.on('roomConfig', (infos) => {
        socket.nickname = infos[0];
        const clients = io.sockets.adapter.rooms.get(infos[1]);
        let players = clients ? clients.size : 0;
        console.log('Players in current room: ' + players);

        if (clients && clients.size >= 2) {
            console.log('Room is full');
            io.to(socket.id).emit('roomFull');
            return;
        } else {

            room = infos[1];
            socket.join(room);
            console.log('Player joined room: ' + room);
            io.in(room).emit('resetPlayer');

            let players = [];

            if (clients) {
                clients.forEach((clientId) => {
                    const clientSocket = io.sockets.sockets.get(clientId);
                    console.log(clientSocket);
                    players.push({
                        nickname: clientSocket.nickname,
                        ip: clientSocket.handshake.address,
                        ip2: clientSocket.handshake.headers.origin,
                    });
                });
            }

            io.to(socket.id).emit('roomJoined', players);
            io.in(room).emit('player-update', players);
        }

        if (players === 1) {
            socket.to(room).emit('changePlayer');
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
});

app.get('/', (req, res) => res.send('hello!'));
http.listen(process.env.PORT || 3000, () => {
    console.log('listening on *:3000');
});