import { createStore } from 'solid-js/store';
import {createComputed, createEffect, createMemo} from 'solid-js';
import { GameState, Player, InningLineup, Position, FIELD_POSITIONS, ValidationError } from './types';

const STORAGE_KEY = 'baseball-roster-state';

function createInitialState(): GameState {
  return {
    players: [],
    lineup: Array(6).fill(null).map(() => ({}))
  };
}

function loadStateFromStorage(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure we have 6 innings
      while (parsed.lineup.length < 6) {
        parsed.lineup.push({});
      }
      // Initialize missing players to BENCH
      parsed.players.forEach((player: Player) => {
        parsed.lineup.forEach((inning: InningLineup, index: number) => {
          if (!(player.id in inning)) {
            parsed.lineup[index][player.id] = 'BENCH';
          }
        });
      });
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to load state from localStorage:', error);
  }
  return createInitialState();
}

function saveStateToStorage(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save state to localStorage:', error);
  }
}

export const [gameState, setGameState] = createStore<GameState>(loadStateFromStorage());

// Auto-save to localStorage
createEffect(() => {
  saveStateToStorage(gameState);
});

export const rosterErrors = createMemo(() =>
  validateAllInnings(gameState)
, [])

// Store actions
export const storeActions = {
  addPlayer: (name: string, positions: Position[]) => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      positions
    };

    setGameState('players', (players) => [...players, newPlayer]);

    // Initialize player in all innings to BENCH
    for (let i = 0; i < 6; i++) {
      setGameState('lineup', i, newPlayer.id, 'BENCH');
    }
  },

  removePlayer: (playerId: string) => {
    setGameState('players', (players) => players.filter(p => p.id !== playerId));

    // Remove from all innings
    for (let i = 0; i < 6; i++) {
      setGameState('lineup', i, (inning) => {
        const newInning = { ...inning };
        delete newInning[playerId];
        return newInning;
      });
    }
  },

  updatePlayerPosition: (playerId: string, inning: number, position: Position) => {
    setGameState('lineup', inning, (currentInning) => ({
      ...currentInning,
      [playerId]: position
    }));
  },

  resetInning: (inning: number) => {
    setGameState('lineup', inning, (currentInning) => {
      const newInning: InningLineup = {};
      Object.keys(currentInning).forEach(playerId => {
        newInning[playerId] = 'BENCH';
      });
      return newInning;
    });
  },

  movePlayer: (fromIndex: number, toIndex: number) => {
    setGameState('players', (players) => {
      const newPlayers = [...players];
      const [moved] = newPlayers.splice(fromIndex, 1);
      newPlayers.splice(toIndex, 0, moved);
      return newPlayers;
    });
  }
};

// Validation helpers
export function validateLineup(state: GameState, inning: number): ValidationError[] {

  const errors: ValidationError[] = [];
  const assignments = state.lineup[inning];

  if (!assignments) return errors;

  const usedPositions = new Set<Position>();
  const playerPositions = Object.values(assignments);

  // Check for duplicates (except BENCH)
  playerPositions.forEach(position => {
    if (position !== 'BENCH' && usedPositions.has(position)) {
      errors.push({
        inning,
        message: `Duplicate position: ${position}`,
        type: 'duplicate'
      });
    }
    usedPositions.add(position);
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
}

export function validateAllInnings(state: GameState): ValidationError[][] {
  const allErrors: ValidationError[][] = [];
  for (let i = 0; i < 6; i++) {
    allErrors[i] = validateLineup(state, i);
  }
  return allErrors;
}

export function getPositionCounts(playerId: string): Record<Position, number> {
  const counts: Record<Position, number> = {
    P: 0, C: 0, '1B': 0, '2B': 0, '3B': 0, SS: 0, LF: 0, CF: 0, RF: 0, BENCH: 0
  };

  gameState.lineup.forEach(inning => {
    const position = inning[playerId];
    if (position) {
      counts[position]++;
    }
  });

  return counts;
}
