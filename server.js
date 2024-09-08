const express = require('express');
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;

var players = {};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('user connected');

    players[socket.id] = {
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50, 
        playerId: socket.id
    }

    socket.emit('currentPlayers', players);

    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('disconnect', function () {
        console.log('user disconnected');

        delete players[socket.id];

        io.emit('disconnectPlayer', socket.id);
    });

    socket.on('playerUpdate', (position) => {
        players[socket.id].x = position.x;
        players[socket.id].y = position.y;
        socket.broadcast.emit('playerUpdated', players[socket.id]);
    });
})

server.listen(port, function () {
    console.log(`Listening on port ${port}`, `http://localhost:${port}`);
});