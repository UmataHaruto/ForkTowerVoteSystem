const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// 🔽 ioを必ず先に定義
const io = new Server(server, {
  cors: { origin: '*' }
});

// 🔽 11項目に対応するvoteDataの初期化
let voteData = {};
for (let i = 0; i < 11; i++) {
  voteData[i] = [];
}

// 参加者一覧（Setで重複防止）
let allParticipants = new Set();

io.on('connection', (socket) => {
  console.log('👤 新しい接続:', socket.id);

  // 初期データ送信
  socket.emit('update', {
    voteData,
    allParticipants: Array.from(allParticipants)
  });

  // 投票処理
  socket.on('vote', ({ name, item }) => {
    if (!(item in voteData)) return;

    // 名前を全項目から削除（再投票対応）
    for (const key in voteData) {
      voteData[key] = voteData[key].filter(n => n !== name);
    }

    // 対象項目に追加
    voteData[item].push(name);
    allParticipants.add(name);

    // 全体に更新通知
    io.emit('update', {
      voteData,
      allParticipants: Array.from(allParticipants)
    });
  });

  // リセット処理
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

// サーバー起動
server.listen(4000, () => {
  console.log('✅ サーバー起動 (port 4000)');
});
