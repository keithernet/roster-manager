import { Component, createSignal } from 'solid-js';
import PlayerManager from './components/PlayerManager';
import LineupGrid from './components/LineupGrid';
import SettingsModal from './components/SettingsModal';
import './App.css';

const App: Component = () => {
  const [isSettingsOpen, setIsSettingsOpen] = createSignal(false);

  return (
    <div class="App">
      <header class="App-header">
        <div class="header-content">
          <div class="header-text">
            <h1>⚾ Baseball Roster Manager</h1>
            <p>Little League Roster and Lineup Management</p>
          </div>
          <button
            class="settings-button"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </header>
      <main class="App-main">
        <PlayerManager />
        <LineupGrid />
      </main>
      <SettingsModal
        isOpen={isSettingsOpen()}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default App;