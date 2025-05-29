import { useEffect, useState } from 'react';
import { socket } from './socket';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [entered, setEntered] = useState(false);
  const [votes, setVotes] = useState({});
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    // サーバーから投票データと参加者一覧を受信
    socket.on('update', ({ voteData, allParticipants }) => {
      setVotes(voteData);
      setParticipants(allParticipants);
    });

    return () => socket.off('update');
  }, []);

  const handleVote = (item) => {
    socket.emit('vote', { name, item });
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
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="vote-item">
              <button
                onClick={() => handleVote(i)}
                disabled={
                  (i === 1 || i === 2) &&
                  votes[i]?.length >= 2 &&
                  !votes[i]?.includes(name)
                }
              >
                項目{i}
              </button>
              <span> 投票者: {votes[i]?.join(', ') || 'なし'}</span>
            </div>
          ))}
          <button className="reset-button" onClick={handleReset}>
            リセット
          </button>
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
