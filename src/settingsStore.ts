import { createStore } from 'solid-js/store';
import { createEffect } from 'solid-js';

const SETTINGS_STORAGE_KEY = 'baseball-roster-settings';

export interface AppSettings {
  numberOfInnings: number;
  warningThreshold: number;
}

function createInitialSettings(): AppSettings {
  return {
    numberOfInnings: 6,
    warningThreshold: 2
  };
}

function loadSettingsFromStorage(): AppSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        numberOfInnings: parsed.numberOfInnings || 6,
        warningThreshold: parsed.warningThreshold || 2
      };
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }
  return createInitialSettings();
}

function saveSettingsToStorage(settings: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error);
  }
}

export const [appSettings, setAppSettings] = createStore<AppSettings>(loadSettingsFromStorage());

// Auto-save to localStorage
createEffect(() => {
  saveSettingsToStorage(appSettings);
});

export const settingsActions = {
  setNumberOfInnings: (count: number) => {
    if (count >= 1 && count <= 12) {
      setAppSettings('numberOfInnings', count);
    }
  },

  setWarningThreshold: (threshold: number) => {
    if (threshold >= 1 && threshold <= 10) {
      setAppSettings('warningThreshold', threshold);
    }
  }
};
