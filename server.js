
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const NUM_ITEMS = 16;
let voteData = {};
let allParticipants = new Set();
let submissions = {};
let matchResults = null;

for (let i = 0; i < NUM_ITEMS; i++) {
  voteData[i] = [];
}

io.on('connection', (socket) => {
  socket.emit('update', {
    voteData,
    allParticipants: Array.from(allParticipants),
    submissions,
    matchResults
  });

  socket.on('vote', ({ name, items }) => {
    for (let i = 0; i < NUM_ITEMS; i++) {
      voteData[i] = voteData[i].filter(n => n !== name);
    }
    items.forEach((item) => {
      const idx = getItemIndex(item);
      if (idx !== -1) {
        voteData[idx].push(name);
      }
    });

    allParticipants.add(name);
    submissions[name] = items;

    io.emit('update', {
      voteData,
      allParticipants: Array.from(allParticipants),
      submissions,
      matchResults
    });
  });

  socket.on('reset', () => {
    voteData = {};
    for (let i = 0; i < NUM_ITEMS; i++) {
      voteData[i] = [];
    }
    allParticipants = new Set();
    submissions = {};
    matchResults = null;

    io.emit('update', {
      voteData,
      allParticipants: [],
      submissions,
      matchResults
    });
  });

  socket.on('match', () => {
    matchResults = generateMockMatchResults(Array.from(allParticipants));
    io.emit('update', {
      voteData,
      allParticipants: Array.from(allParticipants),
      submissions,
      matchResults
    });
  });
});

// 仮のマッチング結果生成（スプレッドシート未参照）
function generateMockMatchResults(names) {
  const roles = ["T1", "H1", "H2", "D1", "D2", "D3", "D4", "D5"];
  const parties = ["A", "B", "C"];
  const result = {};
  const unassigned = [...names];

  for (const p of parties) {
    for (let i = 1; i <= 2; i++) {
      const tag = `${p}${i}`;
      result[tag] = {};
      for (const r of roles) {
        const name = unassigned.shift();
        result[tag][r] = name || null;
      }
    }
  }
  if (unassigned.length) {
    result["未割当"] = {};
    unassigned.forEach((n, i) => result["未割当"][`余り${i+1}`] = n);
  }
  return result;
}

function getItemIndex(label) {
  const labels = [
    "時魔導士Lv4↑(ジョブ：ヒーラー)",
    "時魔導士Lv4↑",
    "シーフLv6↑(ジョブ：DPS)",
    "シーフLv6↑",
    "砲撃士Lv6↑(ジョブ：DPS)",
    "砲撃士Lv6↑",
    "風水士Lv4↑(ジョブ：ヒーラー)",
    "風水士Lv4↑",
    "薬師Lv3↑(ジョブ：タンク)",
    "薬師Lv3↑(ジョブ：DPS)",
    "薬師Lv3↑",
    "詩人Lv4↑(ジョブ：ヒラ)",
    "詩人Lv4↑",
    "タンク",
    "ヒーラー",
    "DPS"
  ];
  return labels.indexOf(label);
}

server.listen(4000, () => {
  console.log("✅ サーバー起動 (port 4000)");
});
