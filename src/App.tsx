import { Component } from 'solid-js';
import PlayerManager from './components/PlayerManager';
import LineupGrid from './components/LineupGrid';
import './App.css';

const App: Component = () => {
  return (
    <div class="App">
      <header class="App-header">
        <h1>⚾ Baseball Roster Manager</h1>
        <p>Little League Roster and Lineup Management</p>
      </header>
      <main class="App-main">
        <PlayerManager />
        <LineupGrid />
      </main>
    </div>
  );
};

export default App;