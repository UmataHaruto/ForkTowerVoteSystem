
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const NUM_ITEMS = 24;
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
    matchResults = generateBalancedMatchResults(Array.from(allParticipants));
    io.emit('update', {
      voteData,
      allParticipants: Array.from(allParticipants),
      submissions,
      matchResults
    });
  });
});

function generateBalancedMatchResults(names) {
  const roles = ["T1", "H1", "H2", "D1", "D2", "D3", "D4", "D5"];
  const parties = ["A", "B", "C", "1", "2", "3"];
  const result = {};
  const unassigned = [...names];

  const leaders = {
    "A": "Aリーダー",
    "B": "Bリーダー",
    "C": "Cリーダー",
    "1": "1リーダー",
    "2": "2リーダー",
    "3": "3リーダー"
  };

  for (const p of parties) {
    result[p] = {};
    for (const r of roles) {
      result[p][r] = null;
    }
  }

  // 優先的にリーダーをT1に割り当て
  Object.entries(leaders).forEach(([key, label]) => {
    const candidates = voteData[getItemIndex(label)] || [];
    if (candidates.length > 0) {
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      result[key]["T1"] = chosen;
      const i = unassigned.indexOf(chosen);
      if (i !== -1) unassigned.splice(i, 1);
    }
  });

  // 各PTの現在人数を数えるヘルパー
  const countMembers = (pt) =>
    Object.values(result[pt]).filter((v) => v !== null).length;

  // 各PTの人数が均等になるように割り当て
  for (const role of roles) {
    for (const pt of parties) {
      if (!result[pt][role]) {
        const name = unassigned.shift();
        if (name) result[pt][role] = name;
      }
    }
  }

  // さらに未割当があれば分離
  if (unassigned.length > 0) {
    result["未割当"] = {};
    unassigned.forEach((n, i) => result["未割当"][`余り${i + 1}`] = n);
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
    "DPS",
    "シーフLv4↑(ジョブDPS)",
    "シーフLv4↑",
    "Aリーダー",
    "Bリーダー",
    "Cリーダー",
    "1リーダー",
    "2リーダー",
    "3リーダー"
  ];
  return labels.indexOf(label);
}

server.listen(4000, () => {
  console.log("✅ サーバー起動 (port 4000)");
});
