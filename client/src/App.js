import { useEffect, useState } from 'react';
import { socket } from './socket';
import './App.css';

// 表示項目と制限を設定（indexとvotesのキーが一致）
const items = [
  { label: "時魔導士Lv4↑", limit: 1 },
  { label: "シーフLv6↑", limit: 1 },
  { label: "砲撃士Lv6↑", limit: 1 },
  { label: "風水士Lv4↑", limit: 6 },
  { label: "薬師Lv3↑", limit: 6 },
  { label: "AMT", limit: 1 },
  { label: "BMT", limit: 1 },
  { label: "CMT", limit: 1 },
  { label: "タンク", limit: null },
  { label: "ヒラ", limit: null },
  { label: "DPS", limit: null }
];

function App() {
  const [name, setName] = useState('');
  const [entered, setEntered] = useState(false);
  const [votes, setVotes] = useState({});
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    socket.on('update', (data) => {
      setVotes(data.voteData);
      setParticipants(data.allParticipants);
    });
    return () => socket.off('update');
  }, []);

  const handleVote = (index) => {
    socket.emit('vote', { name, item: index });
  };

  const handleReset = () => {
    socket.emit('reset');
  };

  return (
    <div className="container">
      {!entered ? (
        <div className="entry">
          <input
            placeholder="名前を入力"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={() => setEntered(true)}>参加</button>
        </div>
      ) : (
        <div className="vote-area">
          <h2>{name}さん、投票してください</h2>
          {items.map((item, i) => (
            <div key={i} className="vote-item">
              <button
                onClick={() => handleVote(i)}
                disabled={
                  item.limit !== null &&
                  votes[i]?.length >= item.limit &&
                  !votes[i]?.includes(name)
                }
              >
                {item.label}
              </button>
              <span> 投票者: {votes[i]?.join(', ') || 'なし'}</span>
            </div>
          ))}
          <button className="reset-button" onClick={handleReset}>リセット</button>
          <div className="participants">
            <h3>参加者一覧</h3>
            <ul>
              {participants.map((p, index) => (
                <li key={index}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
