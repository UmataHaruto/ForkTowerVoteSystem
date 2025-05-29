
import React, { useEffect, useState } from 'react';
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

function App() {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);
  const [voteData, setVoteData] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [matchResults, setMatchResults] = useState(null);
  const [showVote, setShowVote] = useState(false);

  const isAdmin = name.includes("kurapon");

  useEffect(() => {
    socket.on("update", (data) => {
      setVoteData(data.voteData);
      setSubmissions(data.submissions || {});
      setMatchResults(data.matchResults || null);
    });
  }, []);

  const handleSend = () => {
    socket.emit("vote", { name, items: selected });
    setShowVote(true);
  };

  const handleReset = () => {
    socket.emit("reset");
  };

  const handleMatch = () => {
    socket.emit("match");
  };

  return (
    <div className="App">
      {!showVote ? (
        <div>
          <h2>名前を入力してください</h2>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={() => setShowVote(true)}>参加</button>
        </div>
      ) : (
        <div>
          <h2>{name} さん、参加ありがとうございます！</h2>
          <div className="grid">
            {items.map((item, idx) => (
              <label key={idx}>
                <input
                  type="checkbox"
                  checked={selected.includes(item)}
                  onChange={() => {
                    if (selected.includes(item)) {
                      setSelected(selected.filter(i => i !== item));
                    } else {
                      setSelected([...selected, item]);
                    }
                  }}
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
              <h3>送信者一覧</h3>
              <ul>
                {Object.keys(submissions).map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </>
          )}

          {matchResults && (
            <div>
              <h3>マッチング結果</h3>
              {Object.keys(matchResults).map((party) => (
                <div key={party}>
                  <h4>{party}</h4>
                  <table>
                    <tbody>
                      {Object.entries(matchResults[party]).map(([role, player]) => (
                        <tr key={role}>
                          <td>{role}</td>
                          <td>{player}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
