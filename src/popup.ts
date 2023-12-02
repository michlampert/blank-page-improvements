'use strict';

import './popup.css';

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap-icons/font/bootstrap-icons.min.css";


// We will make use of Storage API to get and store `count` value
// More information on Storage API can we found at
// https://developer.chrome.com/extensions/storage

// To get storage access, we have to mention it in `permissions` property of manifest.json file
// More information on Permissions can we found at
// https://developer.chrome.com/extensions/declare_permissions

interface Settings {
  showOtherPages: boolean,
  hideEmptyPages: boolean,
}

const settingsStorage = {
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
}

const counterStorage = {
  get: (cb: (count: number) => void) => {
    chrome.storage.sync.get(['count'], (result) => {
      cb(result.count)
    });
  },
  set: (value: number, cb: () => void) => {
    chrome.storage.sync.set(
      {
        count: value,
      },
      () => {
        cb();
      }
    );
  },
};

function setupSettings(initialSettings: Settings) {
  const showOtherPagesSwitch = document.getElementById('showOtherPagesSwitch') as HTMLInputElement
  const hideEmptyPagesSwitch = document.getElementById('hideEmptyPagesSwitch') as HTMLInputElement

  showOtherPagesSwitch.checked = initialSettings.showOtherPages
  hideEmptyPagesSwitch.checked = initialSettings.hideEmptyPages

  showOtherPagesSwitch.addEventListener("input", updateSettings)
  hideEmptyPagesSwitch.addEventListener("input", updateSettings)
}

function updateSettings() {
  const showOtherPagesSwitch = document.getElementById('showOtherPagesSwitch') as HTMLInputElement
  const hideEmptyPagesSwitch = document.getElementById('hideEmptyPagesSwitch') as HTMLInputElement

  settingsStorage.set(
    {
      showOtherPages: showOtherPagesSwitch.checked, hideEmptyPages: hideEmptyPagesSwitch.checked
    },
    () => {
      hideEmptyPagesSwitch.disabled = !showOtherPagesSwitch.checked
    }
  )
}

function setupCounter(initialValue = 0) {
  document.getElementById('counter')!.innerHTML = initialValue.toString();

  document.getElementById('incrementBtn')!.addEventListener('click', () => {
    updateCounter({
      type: 'INCREMENT',
    });
  });

  document.getElementById('decrementBtn')!.addEventListener('click', () => {
    updateCounter({
      type: 'DECREMENT',
    });
  });
}

function updateCounter({ type }: { type: string }) {
  counterStorage.get((count: number) => {
    let newCount: number;

    if (type === 'INCREMENT') {
      newCount = count + 1;
    } else if (type === 'DECREMENT') {
      newCount = count - 1;
    } else {
      newCount = count;
    }

    counterStorage.set(newCount, () => {
      document.getElementById('counter')!.innerHTML = newCount.toString();

      // Communicate with content script of
      // active tab by sending a message
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];

        chrome.tabs.sendMessage(
          tab.id!,
          {
            type: 'COUNT',
            payload: {
              count: newCount,
            },
          },
          (response) => {
            console.log('Current count value passed to contentScript file');
          }
        );
      });
    });
  });
}

function restoreSettings() {
  settingsStorage.get((settings: Settings) => {
    if (!!settings) {
      setupSettings(settings)
    } else {
      const defaultSettings = {
        showOtherPages: true,
        hideEmptyPages: false
      }
      settingsStorage.set(
        defaultSettings,
        () => setupSettings(defaultSettings)
      )
    }
  })
}

function restoreCounter() {
  // Restore count value
  counterStorage.get((count: number) => {
    if (typeof count === 'undefined') {
      // Set counter value as 0
      counterStorage.set(0, () => {
        setupCounter(0);
      });
    } else {
      setupCounter(count);
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreSettings)

document.addEventListener('DOMContentLoaded', restoreCounter);

// Communicate with background file by sending a message
chrome.runtime.sendMessage(
  {
    type: 'GREETINGS',
    payload: {
      message: 'Hello, my name is Pop. I am from Popup.',
    },
  },
  (response) => {
    console.log(response.message);
  }
);

