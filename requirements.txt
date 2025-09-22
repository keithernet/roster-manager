# Baseball Roster Manager - Requirements

## Core Application Requirements
- SolidJS application for managing little league baseball roster
- 6-inning game support
- Player management with position capabilities
- Per-inning lineup creation with position assignments

## Player Management Features
- Add players with list of positions they can play
- Remove players from roster
- Display positions each player can play
- Show position summary next to player names (e.g., "P(2), 1B(1)" showing position and inning count)
- Collapsible player list to save screen space when done adding players
- Player count display in collapsible header (e.g., "Players ▼ (5)")
- "Select All" button for quickly selecting all field positions when adding players

## Lineup Grid Features
- 6-inning lineup grid with position assignments
- Drag and drop functionality for reordering players in the lineup grid
- Filtered dropdown menus for position selection per inning
- Players can select any position they're capable of playing
- Visual drag handle (⋮⋮) for player rows in lineup grid

## Position Management
- Support for all baseball positions: P (Pitcher), C (Catcher), 1B, 2B, 3B, SS, LF, CF, RF
- BENCH position support (multiple players can be on bench)
- Blank/unassigned option as default state for new players
- There is a button that will semi-randomly assign positions to all the players only allowing
  positions that they can play. Do not assign the same position more than twice.
- BENCH is the default display for unassigned positions
- BENCH always available in dropdowns regardless of player capabilities

## Validation System
- Real-time validation of lineup assignments
- All 9 field positions required for each inning (P, C, 1B, 2B, 3B, SS, LF, CF, RF)
- No duplicate position assignments except BENCH
- Visual validation feedback (red outline of invalid position settings)
- Detailed error messages showing missing/duplicate positions by inning

## Inning Management
- Reset button for each inning to clear all position assignments
- Reset buttons located in inning headers

## Data Persistence
- Local storage for all app state (players and lineup assignments)
- Automatic save on any changes
- Automatic load on page refresh/reload
- Preserve existing position assignments when loading from storage
- Smart initialization for missing lineup entries (default to being on the bench)

## User Interface
- Clean, professional styling with baseball theme
- Responsive design with grid layout for lineup
- Hover effects and visual feedback for interactions
- Drag and drop visual indicators (opacity changes, grab cursors)
- Collapsible player input section for better space management
- Color-coded validation messages

## Technical Requirements
- Built with SolidJS and TypeScript
- Vite for development and build tooling
- CSS Grid for lineup layout
- HTML5 drag and drop API
- Browser localStorage for persistence
- Reactive state management with SolidJS signals and SolidJs store
