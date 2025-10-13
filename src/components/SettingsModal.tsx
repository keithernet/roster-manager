import { Component, Show, For, createSignal } from 'solid-js';
import { appSettings, settingsActions } from '../settingsStore';
import { gameState, storeActions } from '../store';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: Component<SettingsModalProps> = (props) => {
  const [newTeamName, setNewTeamName] = createSignal('');
  const [editingTeamId, setEditingTeamId] = createSignal<string | null>(null);
  const [editingTeamName, setEditingTeamName] = createSignal('');

  const handleNumberOfInningsChange = (e: Event) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    settingsActions.setNumberOfInnings(value);
  };

  const handleWarningThresholdChange = (e: Event) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    settingsActions.setWarningThreshold(value);
  };

  const handleAddTeam = () => {
    const name = newTeamName().trim();
    if (name) {
      storeActions.addTeam(name);
      setNewTeamName('');
    }
  };

  const handleRemoveTeam = (teamId: string) => {
    if (confirm('Are you sure you want to delete this team? All players and lineups will be removed.')) {
      storeActions.removeTeam(teamId);
    }
  };

  const startEditingTeam = (teamId: string, currentName: string) => {
    setEditingTeamId(teamId);
    setEditingTeamName(currentName);
  };

  const saveTeamName = (teamId: string) => {
    const name = editingTeamName().trim();
    if (name) {
      storeActions.renameTeam(teamId, name);
    }
    setEditingTeamId(null);
    setEditingTeamName('');
  };

  const cancelEditing = () => {
    setEditingTeamId(null);
    setEditingTeamName('');
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  return (
    <Show when={props.isOpen}>
      <div class="modal-overlay" onClick={handleOverlayClick}>
        <div class="modal-content">
          <div class="modal-header">
            <h2>Settings</h2>
            <button class="close-button" onClick={props.onClose}>×</button>
          </div>

          <div class="modal-body">
            <div class="setting-group">
              <label>
                Teams
                <span class="setting-description">Manage your teams</span>
              </label>
              <div class="teams-list">
                <For each={gameState.teams}>
                  {(team) => (
                    <div class="team-item">
                      <Show
                        when={editingTeamId() === team.id}
                        fallback={
                          <>
                            <span class="team-name">{team.name}</span>
                            <div class="team-actions">
                              <button
                                class="team-edit-btn"
                                onClick={() => startEditingTeam(team.id, team.name)}
                                title="Rename team"
                              >
                                ✏️
                              </button>
                              <Show when={gameState.teams.length > 1}>
                                <button
                                  class="team-delete-btn"
                                  onClick={() => handleRemoveTeam(team.id)}
                                  title="Delete team"
                                >
                                  🗑️
                                </button>
                              </Show>
                            </div>
                          </>
                        }
                      >
                        <input
                          type="text"
                          class="team-edit-input"
                          value={editingTeamName()}
                          onInput={(e) => setEditingTeamName(e.currentTarget.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') saveTeamName(team.id);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                        />
                        <div class="team-actions">
                          <button
                            class="team-save-btn"
                            onClick={() => saveTeamName(team.id)}
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            class="team-cancel-btn"
                            onClick={cancelEditing}
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
              <div class="add-team-form">
                <input
                  type="text"
                  class="add-team-input"
                  placeholder="New team name..."
                  value={newTeamName()}
                  onInput={(e) => setNewTeamName(e.currentTarget.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTeam()}
                />
                <button class="add-team-btn" onClick={handleAddTeam}>
                  Add Team
                </button>
              </div>
            </div>

            <div class="setting-group">
              <label for="innings-count">
                Number of Innings
                <span class="setting-description">Set how many innings are in a game (1-12)</span>
              </label>
              <input
                id="innings-count"
                type="number"
                min="1"
                max="12"
                value={appSettings.numberOfInnings}
                onInput={handleNumberOfInningsChange}
              />
            </div>

            <div class="setting-group">
              <label for="warning-threshold">
                Position Warning Threshold
                <span class="setting-description">
                  Warn when a player plays more than this many innings at the same position (1-10)
                </span>
              </label>
              <input
                id="warning-threshold"
                type="number"
                min="1"
                max="10"
                value={appSettings.warningThreshold}
                onInput={handleWarningThresholdChange}
              />
            </div>
          </div>

          <div class="modal-footer">
            <button class="done-button" onClick={props.onClose}>Done</button>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default SettingsModal;
