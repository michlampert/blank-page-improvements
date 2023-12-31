import { Settings } from './storage';

export function getWordLimit() {
  return Number(window.localStorage.getItem(`write-pageWordGoal-${window.location.pathname}`) || '0');
}

export function getCharactersCount() {
  return (document.getElementById('sheet')! as HTMLTextAreaElement).value.length;
}

export function setupProgressBar(settings: Settings) {
  if (!settings.charactersCounterEnabled) {
    document.getElementsByClassName('progress-bar charactersGoal')[0]?.remove();
    return;
  }

  const progressBar = document.getElementsByClassName('progress-bar wordGoal')[0] as HTMLElement;
  const charactersProgressBar = progressBar.cloneNode(true) as HTMLElement;
  charactersProgressBar.classList.replace('wordGoal', 'charactersGoal');
  charactersProgressBar.style.backgroundColor = 'rgb( 20, 73, 222 )';
  progressBar.parentElement?.append(charactersProgressBar);
}

export function setupMessages(settings: Settings) {
  const change1: [string, string] = ['Word', 'Character'];
  const change2: [string, string] = ['words', 'characters'];

  if (!settings.charactersCounterEnabled) {
    change1.reverse();
    change2.reverse();
  }

  const label = (
    document.getElementsByClassName('select-option option-pageWordGoal')![0] as HTMLElement
  ).getElementsByClassName('select-option-label')![0] as HTMLElement;
  label.innerHTML = label.innerHTML.replace(...change1);

  const message = document.getElementById('flash-rules')!.firstChild as HTMLElement;
  if (message) message.innerHTML = message.innerHTML.replace(...change2);
}

// Based on obvious observation that count of letters always is greater than count of words,
// so limits will be reached earlier
export function setupCharactersFeature(settings: Settings) {
  setupProgressBar(settings);
  setupMessages(settings);
}

export function updateProgressBar(settings: Settings) {
  if (!settings.charactersCounterEnabled) {
    return;
  }

  const progressBar = document.getElementsByClassName('progress-bar charactersGoal')[0] as HTMLElement;

  const charactersCount = getCharactersCount();
  const wordLimit = getWordLimit();

  progressBar.style.transform = `translate(${Math.min((100.0 * charactersCount) / wordLimit - 100, 0)}%, 0)`;
}

export function updateMessages(settings: Settings) {
  if (!settings.charactersCounterEnabled) {
    return;
  }

  const progressAlert = document.getElementById('flash')!;

  const charactersCount = getCharactersCount();
  const wordLimit = getWordLimit();

  if (charactersCount == wordLimit) {
    const message = document.createElement('span');
    message.innerHTML = `You've reached ${wordLimit} characters`;

    const childs = progressAlert.childNodes;
    childs.forEach((child) => progressAlert.removeChild(child));

    progressAlert.append(message);
    progressAlert.classList.remove('hidden');

    setTimeout(() => {
      progressAlert.classList.add('hidden');
      progressAlert.removeChild(message);
      childs.forEach((child) => progressAlert.append(child));
    }, 3000);
  }
}

export function updateCharacterCountProgress(settings: Settings) {
  updateProgressBar(settings);
  updateMessages(settings);
}
