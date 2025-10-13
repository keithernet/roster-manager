// This file is kept for future global application settings
// Team-specific settings (numberOfInnings, warningThreshold) are now stored per-team in the game state

export interface AppSettings {
  // Placeholder for future global settings
}

function createInitialSettings(): AppSettings {
  return {};
}

export const appSettings: AppSettings = createInitialSettings();
