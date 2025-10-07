import {Component, For, createSignal, createMemo, Show} from 'solid-js';
import {gameState, rosterErrors, storeActions, playerPositionCounts} from '../store';
import { Position, ALL_POSITIONS, FIELD_POSITIONS, ValidationError } from '../types';
import './LineupGrid.css';

const LineupGrid: Component = () => {
  const [draggedPlayer, setDraggedPlayer] = createSignal<string | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = createSignal<number | null>(null);

  const [printMode, setPrintMode] = createSignal(false);

  const handleDragStart = (e: DragEvent, playerId: string, index: number) => {
    setDraggedPlayer(playerId);
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('text/plain', `${playerId},${index}`);
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    setDraggedOverIndex(index);
  };

  const handleDragLeave = () => {
    setDraggedOverIndex(null);
  };

  const handleDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    const data = e.dataTransfer!.getData('text/plain');
    const [playerId, dragIndexStr] = data.split(',');
    const dragIndex = parseInt(dragIndexStr);

    if (dragIndex !== dropIndex) {
      storeActions.movePlayer(dragIndex, dropIndex);
    }

    setDraggedPlayer(null);
    setDraggedOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedPlayer(null);
    setDraggedOverIndex(null);
  };

  const getAvailablePositions = (playerId: string): Position[] => {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return ['BENCH'];

    // Always include BENCH, plus any positions the player can play
    const positions = [...player.positions];
    if (!positions.includes('BENCH')) {
      positions.push('BENCH');
    }
    return positions;
  };

  const getPositionForInning = (playerId: string, inning: number): Position => {
    return gameState.lineup[inning]?.[playerId] || 'BENCH';
  };

  const handlePositionChange = (playerId: string, inning: number, position: Position) => {
    storeActions.updatePlayerPosition(playerId, inning, position);
  };

  const resetInning = (inning: number) => {
    storeActions.resetInning(inning);
  };

  const assignPositions = (inning: number) => {
    storeActions.assignPositionsForInning(inning);
  };

  // Create individual memos for each inning to ensure proper reactivity
  const inningValidations = Array.from({ length: 6 }, (_, inning) =>
    createMemo(() => {
      const errors: ValidationError[] = [];
      const assignments = gameState.lineup[inning];

      if (!assignments || Object.keys(assignments).length === 0) {
        // If no assignments, all positions are missing
        FIELD_POSITIONS.forEach(position => {
          errors.push({
            inning,
            message: `Missing position: ${position}`,
            type: 'missing'
          });
        });
        return errors;
      }

      const usedPositions = new Set<Position>();
      const playerPositions = Object.values(assignments);
      const duplicateTracker = new Map<Position, number>();

      // Count position usage and find duplicates
      playerPositions.forEach(position => {
        if (position && position !== 'BENCH') {
          const count = duplicateTracker.get(position) || 0;
          duplicateTracker.set(position, count + 1);

          if (count >= 1) { // Already seen this position
            errors.push({
              inning,
              message: `Duplicate position: ${position}`,
              type: 'duplicate'
            });
          }
          usedPositions.add(position);
        }
      });

      // Check for missing field positions
      FIELD_POSITIONS.forEach(position => {
        if (!usedPositions.has(position)) {
          errors.push({
            inning,
            message: `Missing position: ${position}`,
            type: 'missing'
          });
        }
      });

      return errors;
    })
  );

  const getOrdinal = (value: number) => value === 1 ? 'st' : value === 2 ? 'nd' : value === 3 ? 'rd': 'th';


  const hasInningErrors = (inning: number) => {
    return inningValidations[inning]()?.length > 0;
  };

  const formatPositionSummary = (playerId: string) => {
    const counts = playerPositionCounts()[playerId] || {};
    const summary = ALL_POSITIONS
      .filter(pos => counts[pos] > 0)
      .map(pos => `${pos}(${counts[pos]})`)
      .join(', ');
    return summary || 'No assignments';
  };

  const playsMoreThanTwoInningsAtSamePosition = (playerId: string) => {
    const counts = playerPositionCounts()[playerId] || {};
    return ALL_POSITIONS.some(pos => counts[pos] > 2);
  };

  function togglePrint(){
   setPrintMode(!printMode());
  }

  return (
    <div class="lineup-grid">
      <h2>Lineup Grid <a href="#" onClick={() => togglePrint()}>{printMode() ? "Edit": "Print"}</a></h2>

      <div class="grid-container">
        <div class="grid-header">
          <div class="player-column-header">Player</div>
          <For each={Array(6).fill(0)}>
            {(_, index) => (
              <div class={`inning-header ${hasInningErrors(index()) ? 'has-errors' : ''}`}>
                <span>Inning {index() + 1}</span>
                <Show when={!printMode()}>
                <div class="inning-buttons">
                  <button
                    class="assign-positions-btn"
                    onClick={() => assignPositions(index())}
                    title="Auto-assign positions for this inning"
                  >
                    ⚾
                  </button>
                  <button
                    class="reset-inning-btn"
                    onClick={() => resetInning(index())}
                    title="Reset this inning"
                  >
                    ↻
                  </button>
                </div>
                </Show>
              </div>
            )}
          </For>
        </div>

        <div class="grid-body">
          <For each={gameState.players}>
            {(player, index) => (
              <div
                class={`player-row ${draggedPlayer() === player.id ? 'dragging' : ''} ${draggedOverIndex() === index() ? 'drag-over' : ''}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, player.id, index())}
                onDragOver={(e) => handleDragOver(e, index())}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index())}
                onDragEnd={handleDragEnd}
              >
                <div class="player-cell" classList={{'too-many': playsMoreThanTwoInningsAtSamePosition(player.id)}}>
                  <span class="drag-handle">⋮⋮</span>
                  <div class="player-info">
                    <span class="player-name">{player.name}</span>
                    <Show when={!printMode()}>
                      <span class="player-positions">{formatPositionSummary(player.id)}</span>
                    </Show>
                  </div>
                </div>

                <For each={Array(6).fill(0)}>
                  {(_, inningIndex) => (
                    <div class="position-cell">
                      <Show when={!printMode()}>
                      <select
                        class={`position-select ${hasInningErrors(inningIndex()) ? 'has-error' : ''}`}
                        value={getPositionForInning(player.id, inningIndex())}
                        onChange={(e) => handlePositionChange(player.id, inningIndex(), e.currentTarget.value as Position)}
                      >
                        <For each={getAvailablePositions(player.id)}>
                          {(position) => (
                            <option value={position}>{position}</option>
                          )}
                        </For>
                      </select>
                      </Show>
                      <Show when={printMode()}>
                        {getPositionForInning(player.id, inningIndex())}
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Validation Messages */}
      <div class="validation-messages">
        <For each={rosterErrors()}>
          {(errors, idx) => {
            return errors.length > 0 ? (
              <div class="inning-errors">
                <h4>{idx() + 1}{getOrdinal(idx() + 1)} inning Errors:</h4>
                <For each={errors}>
                  {(error) => (
                    <div class={`error-message ${error.type}`}>
                      {error.message}
                    </div>
                  )}
                </For>
              </div>
            ) : null;
          }}
        </For>
      </div>
    </div>
  );
};

export default LineupGrid;
