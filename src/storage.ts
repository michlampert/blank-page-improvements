export interface Settings {
  showOtherPages: boolean;
  hideEmptyPages: boolean;
  charactersCounterEnabled: boolean,
}

export const defaultSettings: Settings = {
  showOtherPages: true,
  hideEmptyPages: false,
  charactersCounterEnabled: false,
};

export const settingsStorage = {
  get: (cb: (settings: Settings) => void) => {
    chrome.storage.sync.get(['settings'], (result) => {
      cb(result.settings);
    });
  },
  set: (settings: Settings, cb: () => void) => {
    chrome.storage.sync.set(
      {
        settings,
      },
      () => {
        cb();
      }
    );
  },
};

export function restoreSettings(cb: (settings: Settings) => any) {
  settingsStorage.get((settings: Settings) => {
    if (!!settings) {
      cb(settings);
    } else {
      settingsStorage.set(defaultSettings, () => cb(defaultSettings));
    }
  });
}
