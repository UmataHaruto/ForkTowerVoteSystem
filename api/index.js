
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

let voteData = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: []
};

io.on('connection', (socket) => {
  socket.emit('update', voteData);

  socket.on('vote', ({ name, item }) => {
    const current = voteData[item];
    const isLimited = item === 1 || item === 2;

    if (isLimited && current.length >= 2) return;

    for (const key in voteData) {
      voteData[key] = voteData[key].filter(n => n !== name);
    }

    voteData[item].push(name);
    io.emit('update', voteData);
  });

  socket.on('reset', () => {
    voteData = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    io.emit('update', voteData);
  });
});

module.exports = app;
