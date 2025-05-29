
import { useEffect, useState } from 'react';
import { socket } from './socket';
import './App.css';

const items = [
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

function App() {
  const [name, setName] = useState('');
  const [entered, setEntered] = useState(false);
  const [selected, setSelected] = useState([]);
  const [votes, setVotes] = useState({});
  const [participants, setParticipants] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [matchResults, setMatchResults] = useState(null);

  const isAdmin = name.toLowerCase().includes("kurapon");

  useEffect(() => {
    socket.on('update', (data) => {
      setVotes(data.voteData || {});
      setParticipants(data.allParticipants || []);
      setSubmissions(data.submissions || {});
      setMatchResults(data.matchResults || null);
    });
    return () => socket.off('update');
  }, []);

  const handleSend = () => {
    socket.emit('vote', { name, items: selected });
  };

  const handleReset = () => {
    socket.emit('reset');
  };

  const handleMatch = () => {
    socket.emit('match');
  };

  const toggleSelect = (item) => {
    setSelected(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
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
          <h2>{isAdmin ? "管理者モード" : `${name}さん、ロールを選んでください`}</h2>

          <div className="options">
            {items.map((item, idx) => (
              <label key={idx}>
                <input
                  type="checkbox"
                  checked={selected.includes(item)}
                  onChange={() => toggleSelect(item)}
                />
                {item}
              </label>
            ))}
          </div>

          <button onClick={handleSend}>送信</button>

          {isAdmin && (
            <>
              <button onClick={handleReset}>リセット</button>
              <button onClick={handleMatch}>マッチング</button>

              <div className="submissions">
                <h3>送信済みユーザー:</h3>
                <ul>
                  {Object.keys(submissions).map((user, i) => (
                    <li key={i}>{user}: {submissions[user].join(", ")}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <div className="participants">
            <h3>参加者一覧</h3>
            <ul>
              {participants.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          {matchResults && (
            <div className="results">
              <h3>マッチング結果</h3>
              {Object.entries(matchResults).map(([party, roles], i) => (
                <div key={i}>
                  <h4>パーティ {party}</h4>
                  <ul>
                    {Object.entries(roles).map(([role, member], j) => (
                      <li key={j}>{role}: {member || "未割当"}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
