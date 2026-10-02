const STORED_SCALE = 'mfa-text-scale';

const SCALES = [
  { value: '1', name: 'Normal' },
  { value: '1.25', name: 'Larger' },
  { value: '1.5', name: 'Largest' }
];

const DEFAULT_SCALE = '1';

function isKnownScale(value) {
  return SCALES.some((scale) => scale.value === value);
}

function readStoredScale() {
  try {
    const stored = localStorage.getItem(STORED_SCALE);
    return isKnownScale(stored) ? stored : null;
  } catch (error) {
    return null;
  }
}

function storeScale(value) {
  try {
    localStorage.setItem(STORED_SCALE, value);
  } catch (error) {
    return;
  }
}

let currentScale = readStoredScale() || DEFAULT_SCALE;

document.documentElement.style.setProperty('--text-scale', currentScale);

function markPressed() {
  document.querySelectorAll('[data-text-scale]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.textScale === currentScale));
  });
}

function setTextScale(value, persist = true) {
  if (!isKnownScale(value)) return;

  currentScale = value;
  document.documentElement.style.setProperty('--text-scale', currentScale);
  markPressed();

  if (persist) storeScale(currentScale);
}

function buildControl(host) {
  const label = document.createElement('span');
  label.className = 'text-size-label';
  label.textContent = 'Text size';
  host.appendChild(label);

  SCALES.forEach((scale) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'w3-button w3-white';
    button.dataset.textScale = scale.value;
    button.setAttribute('aria-label', `${scale.name} text size`);
    button.setAttribute('aria-pressed', String(scale.value === currentScale));

    const letter = document.createElement('span');
    letter.className = 'text-size-letter';
    letter.setAttribute('aria-hidden', 'true');
    letter.textContent = 'A';

    const name = document.createElement('span');
    name.className = 'text-size-name';
    name.textContent = scale.name;

    button.append(letter, name);
    button.addEventListener('click', () => setTextScale(scale.value));
    host.appendChild(button);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-text-size]').forEach(buildControl);
});

window.addEventListener('storage', (event) => {
  if (event.key === STORED_SCALE) setTextScale(event.newValue, false);
});
