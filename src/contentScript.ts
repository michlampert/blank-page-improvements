import { setupCharactersFeature, updateCharacterCountProgress } from './charactersCounter';
import { updateLinks } from './otherFiles';
import { restoreSettings } from './storage';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'UPDATE_SETTINGS') {
    restoreSettings(updateLinks);
    restoreSettings(setupCharactersFeature);
    restoreSettings(updateCharacterCountProgress);
  }

  sendResponse({});
  true;
});

window.addEventListener('load', () => restoreSettings(updateLinks));
document.getElementById('sheet')?.addEventListener('change', () => restoreSettings(updateLinks));

window.addEventListener('load', () => {
  restoreSettings(setupCharactersFeature);
  restoreSettings(updateCharacterCountProgress);
});
document.getElementById('sheet')!.addEventListener('input', () => restoreSettings(updateCharacterCountProgress));
