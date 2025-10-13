import { Component, Show } from 'solid-js';
import { appSettings, settingsActions } from '../settingsStore';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: Component<SettingsModalProps> = (props) => {
  const handleNumberOfInningsChange = (e: Event) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    settingsActions.setNumberOfInnings(value);
  };

  const handleWarningThresholdChange = (e: Event) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    settingsActions.setWarningThreshold(value);
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
