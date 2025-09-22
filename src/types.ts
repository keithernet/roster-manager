export type Position = 'P' | 'C' | '1B' | '2B' | '3B' | 'SS' | 'LF' | 'CF' | 'RF' | 'BENCH';

export const FIELD_POSITIONS: Position[] = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
export const ALL_POSITIONS: Position[] = [...FIELD_POSITIONS, 'BENCH'];

export interface Player {
  id: string;
  name: string;
  positions: Position[];
}

export interface LineupAssignment {
  playerId: string;
  position: Position;
}

export interface InningLineup {
  [playerId: string]: Position;
}

export interface GameState {
  players: Player[];
  lineup: InningLineup[];
}

export interface ValidationError {
  inning: number;
  message: string;
  type: 'missing' | 'duplicate';
}