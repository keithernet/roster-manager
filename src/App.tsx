import { Component, createSignal, For, Show } from 'solid-js';
import PlayerManager from './components/PlayerManager';
import LineupGrid from './components/LineupGrid';
import SettingsModal from './components/SettingsModal';
import { gameState, storeActions, activeTeam } from './store';
import './App.css';

const App: Component = () => {
  const [isSettingsOpen, setIsSettingsOpen] = createSignal(false);
  const [isTeamSelectorOpen, setIsTeamSelectorOpen] = createSignal(false);

  const handleTeamChange = (teamId: string) => {
    storeActions.switchTeam(teamId);
    setIsTeamSelectorOpen(false);
  };

  return (
    <div class="App">
      <header class="App-header">
        <div class="header-content">
          <div class="header-text">
            <h1>⚾ Baseball Roster Manager</h1>
            <p>Little League Roster and Lineup Management</p>
          </div>
          <div class="header-controls">
            <div class="team-selector-container">
              <button
                class="team-selector-button"
                onClick={() => setIsTeamSelectorOpen(!isTeamSelectorOpen())}
                title="Select team"
              >
                {activeTeam().name} ▾
              </button>
              <Show when={isTeamSelectorOpen()}>
                <div class="team-dropdown">
                  <For each={gameState.teams}>
                    {(team) => (
                      <button
                        class={`team-option ${team.id === gameState.activeTeamId ? 'active' : ''}`}
                        onClick={() => handleTeamChange(team.id)}
                      >
                        {team.name}
                        <Show when={team.id === gameState.activeTeamId}>
                          <span class="checkmark">✓</span>
                        </Show>
                      </button>
                    )}
                  </For>
                </div>
              </Show>
            </div>
            <button
              class="settings-button"
              onClick={() => setIsSettingsOpen(true)}
              title="Settings"
            >
              <span class="settings-icon">⚙️</span>
            </button>
          </div>
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
