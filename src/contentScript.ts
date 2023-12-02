import { Settings, restoreSettings } from './storage';

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
      .flatMap((a: string | HTMLAnchorElement) => ['↳ ', a, document.createElement('br')])
  );

  return container;
}

function getPages(filtered: boolean = false): string[] {
  const re = /write-pageId-(.*)/;

  return Object.keys(window.localStorage)
    .map((key) => re.exec(key)?.[1])
    .filter((name): name is string => !!name)
    .filter(
      (name) =>
        !filtered || name == '/' || name == window.location.pathname || window.localStorage[`write-pageContent-${name}`]
    );
}

function updateLinks(settings: Settings) {
  document.getElementById('improvements-other-pages')?.remove();
  const sidebar = document.getElementById('sidebar-body');

  if (sidebar && settings.showOtherPages) {
    const container = createComponent(getPages(settings.hideEmptyPages));
    sidebar.appendChild(container);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'UPDATE_SETTINGS') {
    restoreSettings(updateLinks);
  }

  sendResponse({});
  true;
});

window.addEventListener('load', () => restoreSettings(updateLinks));
document.getElementById('sheet')?.addEventListener('change', () => restoreSettings(updateLinks));
