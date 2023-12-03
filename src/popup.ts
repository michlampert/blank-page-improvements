'use strict';

import './popup.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import { Settings, restoreSettings, settingsStorage } from './storage';

// We will make use of Storage API to get and store `count` value
// More information on Storage API can we found at
// https://developer.chrome.com/extensions/storage

// To get storage access, we have to mention it in `permissions` property of manifest.json file
// More information on Permissions can we found at
// https://developer.chrome.com/extensions/declare_permissions

function setupSettings(settings: Settings) {
  const showOtherPagesSwitch = document.getElementById('showOtherPagesSwitch') as HTMLInputElement;
  const hideEmptyPagesSwitch = document.getElementById('hideEmptyPagesSwitch') as HTMLInputElement;
  const characterCounterFeatureSwitch = document.getElementById('characterCounterFeatureSwitch') as HTMLInputElement;

  showOtherPagesSwitch.checked = settings.showOtherPages;
  hideEmptyPagesSwitch.checked = settings.hideEmptyPages;
  characterCounterFeatureSwitch.checked = settings.charactersCounterEnabled;

  showOtherPagesSwitch.addEventListener('input', updateSettings);
  hideEmptyPagesSwitch.addEventListener('input', updateSettings);
  characterCounterFeatureSwitch.addEventListener('input', updateSettings);
}

function updateSettings() {
  const showOtherPagesSwitch = document.getElementById('showOtherPagesSwitch') as HTMLInputElement;
  const hideEmptyPagesSwitch = document.getElementById('hideEmptyPagesSwitch') as HTMLInputElement;
  const characterCounterFeatureSwitch = document.getElementById('characterCounterFeatureSwitch') as HTMLInputElement;

  const settings = {
    showOtherPages: showOtherPagesSwitch.checked,
    hideEmptyPages: hideEmptyPagesSwitch.checked,
    charactersCounterEnabled: characterCounterFeatureSwitch.checked,
  };

  settingsStorage.set(settings, () => {
    hideEmptyPagesSwitch.disabled = !showOtherPagesSwitch.checked;
    chrome.tabs.query({}, (tabs) => {
      tabs
        .filter((tab) => tab.url?.match(/blank.page/))
        .forEach((tab) => {
          chrome.tabs.sendMessage(
            tab.id!,
            {
              type: 'UPDATE_SETTINGS',
              payload: {
                tab: tab,
              },
            },
            (response) => {
              console.log(response);
            }
          );
          console.log(tab);
        });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => restoreSettings(setupSettings));
