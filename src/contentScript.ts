import { updateLinks } from './otherFiles';
import { Settings, restoreSettings } from './storage';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'UPDATE_SETTINGS') {
    restoreSettings(updateLinks);
  }

  sendResponse({});
  true;
});

window.addEventListener('load', () => restoreSettings(updateLinks));
document.getElementById('sheet')?.addEventListener('change', () => restoreSettings(updateLinks));

function getWordLimit() {
  return Number(window.localStorage.getItem(`write-pageWordGoal-${window.location.pathname}`) || "0")
}

function getCharactersCount() {
  return (document.getElementById("sheet")! as HTMLTextAreaElement).value.length
}

function setupProgressBar(setting: Settings) {
  const progressBar = document.getElementsByClassName("progress-bar wordGoal")[0] as HTMLElement
  const charactersProgressBar = progressBar.cloneNode(true) as HTMLElement
  charactersProgressBar.classList.replace("wordGoal", "charactersGoal")
  charactersProgressBar.style.backgroundColor = "rgb( 20, 73, 222 )"
  progressBar.parentElement?.append(charactersProgressBar)
}

function setupMessages(setting: Settings) {
  const label = (document.getElementsByClassName("select-option option-pageWordGoal")![0] as HTMLElement)
    .getElementsByClassName("select-option-label")![0] as HTMLElement
  label.innerHTML = label.innerHTML.replace("Word", "Character")

  const message = document.getElementById("flash-rules")!.firstChild as HTMLElement
  if (message) message.innerHTML = message.innerHTML.replace("words", "characters")
}


// Based on obvious observation that count of letters always is greater than count of words,
// so limits will be reached earlier
function setupCharactersFeature(setting: Settings) {
  setupProgressBar(setting)
  setupMessages(setting)
}

function updateProgressBar(setting: Settings) {
  const progressBar = document.getElementsByClassName("progress-bar charactersGoal")[0] as HTMLElement

  const charactersCount = getCharactersCount()
  const wordLimit = getWordLimit()

  progressBar.style.transform = `translate(${Math.min(100.0 * charactersCount / wordLimit - 100, 0)}%, 0)`
}

function updateMessages(setting: Settings) {
  const progressAlert = document.getElementById("flash")!

  const charactersCount = getCharactersCount()
  const wordLimit = getWordLimit()

  if (charactersCount == wordLimit) {
    const message = document.createElement("span")
    message.innerHTML = `You've reached ${wordLimit} characters`

    const childs = progressAlert.childNodes
    childs.forEach(child => progressAlert.removeChild(child))

    progressAlert.append(message)
    progressAlert.classList.remove("hidden")

    setTimeout(() => {
      progressAlert.classList.add("hidden")
      progressAlert.removeChild(message)
      childs.forEach(child => progressAlert.append(child))
    }, 3000)
  }
}


function updateCharacterCountProgress(setting: Settings) {
  updateProgressBar(setting)
  updateMessages(setting)
}

window.addEventListener('load', () => restoreSettings(setupCharactersFeature));
document.getElementById("sheet")!.addEventListener("input", () => restoreSettings(updateCharacterCountProgress))