import './PlayerList.css';

function PlayerList({ players, currentPlayerId }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="player-list-container">
      <div className="player-list-header">
        <h3>👥 Players ({players.length})</h3>
      </div>

      <div className="player-list">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`player-item ${player.id === currentPlayerId ? 'current-player' : ''} ${player.isDrawer ? 'drawer' : ''}`}
          >
            <div className="player-rank">#{index + 1}</div>
            <div className="player-info">
              <div className="player-name">
                {player.name}
                {player.isDrawer && ' 🎨'}
                {player.hasGuessed && ' ✓'}
                {player.id === currentPlayerId && ' (You)'}
              </div>
              <div className="player-score">{player.score} pts</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayerList;
