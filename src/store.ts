import { createStore } from 'solid-js/store';
import {createComputed, createEffect, createMemo} from 'solid-js';
import { GameState, Player, InningLineup, Position, FIELD_POSITIONS, ValidationError } from './types';
import { appSettings } from './settingsStore';
import {sortBy, omit} from 'ramda';

const STORAGE_KEY = 'baseball-roster-state';

function createInitialState(): GameState {
  return {
    players: [],
    lineup: Array(appSettings.numberOfInnings).fill(null).map(() => ({}))
  };
}

function loadStateFromStorage(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const requiredInnings = appSettings.numberOfInnings;

      // Ensure we have the correct number of innings
      while (parsed.lineup.length < requiredInnings) {
        parsed.lineup.push({});
      }
      // Trim if we have too many innings
      if (parsed.lineup.length > requiredInnings) {
        parsed.lineup = parsed.lineup.slice(0, requiredInnings);
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

export const sortedPlayers = createMemo(() => {
  // @ts-ignore
  return sortBy((a: Player, b: Player) => a.name.toLowerCase(), gameState.players);
});

createEffect(() =>{
  console.log(sortedPlayers().map((player: Player) => player.name))
})

// Auto-save to localStorage
createEffect(() => {
  saveStateToStorage(gameState);
});

// Adjust lineup when number of innings changes
createEffect(() => {
  const requiredInnings = appSettings.numberOfInnings;
  const currentInnings = gameState.lineup.length;

  if (currentInnings < requiredInnings) {
    // Add missing innings
    const newInnings = Array(requiredInnings - currentInnings).fill(null).map(() => {
      const inning: InningLineup = {};
      gameState.players.forEach(player => {
        inning[player.id] = 'BENCH';
      });
      return inning;
    });
    setGameState('lineup', [...gameState.lineup, ...newInnings]);
  } else if (currentInnings > requiredInnings) {
    // Remove extra innings
    setGameState('lineup', gameState.lineup.slice(0, requiredInnings));
  }
});

export const rosterErrors = createMemo(() =>
  validateAllInnings(gameState)
, )

export const playerPositionCounts = createMemo(() => {
  const counts: Record<string, Record<Position, number>> = {};

  gameState.players.forEach(player => {
    counts[player.id] = {
      P: 0, C: 0, '1B': 0, '2B': 0, '3B': 0, SS: 0, LF: 0, CF: 0, RF: 0, BENCH: 0
    };

    gameState.lineup.forEach(inning => {
      const position = inning[player.id];
      if (position) {
        counts[player.id][position]++;
      }
    });
  });

  return counts;
});

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
    for (let i = 0; i < appSettings.numberOfInnings; i++) {
      setGameState('lineup', i, newPlayer.id, 'BENCH');
    }
  },

  removePlayer: (playerId: string) => {
    setGameState('players', (players) => players.filter(p => p.id !== playerId));

    const newLineup = gameState.lineup.map(lineup => omit([playerId], lineup));
    setGameState('lineup', newLineup);
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
  },

  assignPositionsForInning: (inning: number) => {
    const players = gameState.players;
    if (players.length === 0) return;

    // Reset inning first
    const newAssignments: InningLineup = {};
    players.forEach(player => {
      newAssignments[player.id] = 'BENCH';
    });

    // Create a list of available positions to assign
    const positionsToAssign = [...FIELD_POSITIONS];
    const playersAvailable = [...players];

    // Shuffle players for randomness in assignment order
    for (let i = playersAvailable.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playersAvailable[i], playersAvailable[j]] = [playersAvailable[j], playersAvailable[i]];
    }

    // Try to assign each position
    positionsToAssign.forEach(position => {
      // Find first available player who can play this position and isn't already assigned
      const availablePlayer = playersAvailable.find(player =>
        player.positions.includes(position) && newAssignments[player.id] === 'BENCH'
      );

      if (availablePlayer) {
        newAssignments[availablePlayer.id] = position;
      }
    });

    // Update the store
    setGameState('lineup', inning, newAssignments);
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
  for (let i = 0; i < appSettings.numberOfInnings; i++) {
    allErrors[i] = validateLineup(state, i);
  }
  return allErrors;
}
