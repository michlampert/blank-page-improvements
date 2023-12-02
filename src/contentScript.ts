// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

window.addEventListener("load", updateLinks)

function createComponent(names: string[]): HTMLElement {
  const container = document.createElement("div")
  container.id = "improvements-other-pages"

  const p = document.createElement("p")
  p.innerHTML = "Other blank pages you've been working on:"
  container.append(p)

  container.append(
    ...names.toSorted()
      .map(name => {
        if (name == window.location.pathname) {
          return name
        }

        const a = document.createElement("a")
        a.innerHTML = name
        a.href = window.location.origin + name
        return a
      })
      .flatMap(a => ["↳ ", a, document.createElement("br")])
  )

  return container
}

function getPages(): string[] {
  const re = /write-pageContent-(.*)/

  return Object.keys(window.localStorage)
    .map(key => re.exec(key)?.[1])
    .filter((name): name is string => !!name)
}

function updateLinks() {
  const sidebar = document.getElementById("sidebar-body")

  if (sidebar) {
    document.getElementById("improvements-other-pages")?.remove()
    const container = createComponent(getPages())
    sidebar.appendChild(container)
  }

}

// Communicate with background file by sending a message
chrome.runtime.sendMessage(
  {
    type: 'GREETINGS',
    payload: {
      message: 'Hello, my name is Con. I am from ContentScript.',
    },
  },
  (response) => {
    console.log(response.message);
  }
);

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log(`Current count is ${request.payload.count}`);
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});