
import { useEffect, useState } from 'react';
import { socket } from './socket';

function App() {
  const [name, setName] = useState('');
  const [entered, setEntered] = useState(false);
  const [votes, setVotes] = useState({});

  useEffect(() => {
    socket.on('update', (data) => {
      setVotes(data);
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
    <div>
      {!entered ? (
        <div>
          <input placeholder="名前を入力" value={name} onChange={e => setName(e.target.value)} />
          <button onClick={() => setEntered(true)}>参加</button>
        </div>
      ) : (
        <div>
          <h2>{name}さん、投票してください</h2>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i}>
              <button
                onClick={() => handleVote(i)}
                disabled={(i === 1 || i === 2) && votes[i]?.length >= 2 && !votes[i].includes(name)}
              >
                項目{i}
              </button>
              <span> 投票者: {votes[i]?.join(', ') || 'なし'}</span>
            </div>
          ))}
          <button onClick={handleReset}>リセット</button>
        </div>
      )}
    </div>
  );
}

export default App;
