'use strict';

const server = require('http').createServer();
const io = require('socket.io')(server, {
  path: '/',
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

let registry = {};

io.on('connection', (socket) => {
  console.log('[user ' + socket.id + '] connected');

  socket.on('identify', (data) => {
    socket.emit('current-users', registry);
    registry[socket.id] = {
      id: socket.id,
      username: data.username,
      publicKey: data.publicKey
    };
    console.log(JSON.stringify(registry));
    socket.broadcast.emit('user-join', registry[socket.id]);
  });

  socket.on('message', (msg) => {
    console.log('[' + socket.id + '] -> [' + msg.recipient + ']');
    socket.broadcast.to(msg.recipient).emit('message', msg.message);
  });

  socket.on('disconnect', () => {
    console.log('[user ' + socket.id + '] disconnected');
    delete registry[socket.id];
    socket.broadcast.emit('user-leave', socket.id);
  });
});

server.listen(3000);
