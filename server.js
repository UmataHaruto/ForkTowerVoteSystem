let voteData = {};
for (let i = 0; i < 11; i++) {
  voteData[i] = [];
}

let allParticipants = new Set();

io.on('connection', (socket) => {
  socket.emit('update', {
    voteData,
    allParticipants: Array.from(allParticipants)
  });

  socket.on('vote', ({ name, item }) => {
    if (!(item in voteData)) return;

    // 参加者登録
    for (const key in voteData) {
      voteData[key] = voteData[key].filter(n => n !== name);
    }
    voteData[item].push(name);
    allParticipants.add(name);

    io.emit('update', {
      voteData,
      allParticipants: Array.from(allParticipants)
    });
  });

  socket.on('reset', () => {
    voteData = {};
    for (let i = 0; i < 11; i++) {
      voteData[i] = [];
    }
    allParticipants = new Set();
    io.emit('update', {
      voteData,
      allParticipants: []
    });
  });
});
