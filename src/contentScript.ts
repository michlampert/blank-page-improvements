// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

import { Settings, defaultSettings, restoreSettings } from './storage';

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

function createComponent(names: string[]): HTMLElement {
  const container = document.createElement('div');
  container.id = 'improvements-other-pages';

  const p = document.createElement('p');
  p.innerHTML = "Other blank pages you've been working on:";
  container.append(p);

  container.append(
    ...names
      .toSorted()
      .map((name: string): string | HTMLAnchorElement => {
        if (name == window.location.pathname) {
          return name;
        }

        const a = document.createElement('a');
        a.innerHTML = name;
        a.href = window.location.origin + name;
        return a;
      })
      .flatMap((a: string | HTMLAnchorElement) => [
        '↳ ',
        a,
        document.createElement('br'),
      ])
  );

  return container;
}

function getPages(): string[] {
  const re = /write-pageContent-(.*)/;

  return Object.keys(window.localStorage)
    .map((key) => re.exec(key)?.[1])
    .filter((name): name is string => !!name);
}

function updateLinks(settings: Settings) {
  console.log(settings);
  const sidebar = document.getElementById('sidebar-body');

  if (sidebar && settings.showOtherPages) {
    document.getElementById('improvements-other-pages')?.remove();
    const container = createComponent(getPages());
    sidebar.appendChild(container);
  }
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === 'UPDATE_SETTINGS') {
    restoreSettings(updateLinks);
  }
  
  sendResponse({});
  true;
});

window.addEventListener('load', () => restoreSettings(updateLinks));
