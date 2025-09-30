import { Component, createSignal, For, createMemo } from 'solid-js';
import {gameState, sortedPlayers, storeActions, playerPositionCounts} from '../store';
import { Position, ALL_POSITIONS, FIELD_POSITIONS } from '../types';
import './PlayerManager.css';

const PlayerManager: Component = () => {
  const [playerName, setPlayerName] = createSignal('');
  const [selectedPositions, setSelectedPositions] = createSignal<Set<Position>>(new Set());
  const [isCollapsed, setIsCollapsed] = createSignal(false);

  const handleAddPlayer = () => {
    const name = playerName().trim();
    const positions = Array.from(selectedPositions());

    if (name && positions.length > 0) {
      storeActions.addPlayer(name, positions);
      setPlayerName('');
      setSelectedPositions(new Set<Position>());
    }
  };

  const togglePosition = (position: Position) => {
    const current = selectedPositions();
    const newSelected = new Set(current);

    if (newSelected.has(position)) {
      newSelected.delete(position);
    } else {
      newSelected.add(position);
    }

    setSelectedPositions(newSelected);
  };

  const selectAllFieldPositions = () => {
    setSelectedPositions(new Set<Position>(FIELD_POSITIONS));
  };

  const formatPositionSummary = (playerId: string) => {
    const counts = playerPositionCounts()[playerId] || {};
    const summary = ALL_POSITIONS
      .filter(pos => counts[pos] > 0)
      .map(pos => `${pos}(${counts[pos]})`)
      .join(', ');
    return summary || 'No assignments';
  };

  return (
    <div class="player-manager">
      <div class="player-header" onClick={() => setIsCollapsed(!isCollapsed())}>
        <h2>
          Players {isCollapsed() ? '▶' : '▼'} ({gameState.players.length})
        </h2>
      </div>

      {!isCollapsed() && (
        <div class="player-content">
          <div class="add-player-form">
            <div class="form-row">
              <input
                type="text"
                placeholder="Player name"
                value={playerName()}
                onInput={(e) => setPlayerName(e.currentTarget.value)}
                class="player-name-input"
              />
              <button
                onClick={handleAddPlayer}
                disabled={!playerName().trim() || selectedPositions().size === 0}
                class="add-player-btn"
              >
                Add Player
              </button>
            </div>

            <div class="position-selection">
              <div class="position-header">
                <span>Positions this player can play:</span>
                <button
                  onClick={selectAllFieldPositions}
                  class="select-all-btn"
                >
                  Select All Field Positions
                </button>
              </div>

              <div class="position-checkboxes">
                <For each={ALL_POSITIONS}>
                  {(position) => (
                    <label class="position-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedPositions().has(position)}
                        onChange={() => togglePosition(position)}
                      />
                      <span class="position-label">{position}</span>
                    </label>
                  )}
                </For>
              </div>
            </div>
          </div>

          <div class="player-list">
            <For each={sortedPlayers()}>
              {(player) => (
                <div class="player-item">
                  <div class="player-info">
                    <span class="player-name">{player.name}</span>
                    <span class="player-positions">
                      Can play: {player.positions.join(', ')}
                    </span>
                    <span class="player-summary">
                      Assignments: {formatPositionSummary(player.id)}
                    </span>
                  </div>
                  <button
                    onClick={() => storeActions.removePlayer(player.id)}
                    class="remove-player-btn"
                  >
                    Remove
                  </button>
                </div>
              )}
            </For>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerManager;
