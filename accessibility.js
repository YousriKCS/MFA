const STORED_SCALE = 'mfa-text-scale';

const textSizeButtons = document.querySelectorAll('[data-text-scale]');

function setTextScale(value) {
  document.documentElement.style.setProperty('--text-scale', value);

  textSizeButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.textScale === value));
  });

  try {
    localStorage.setItem(STORED_SCALE, value);
  } catch (error) {
    return;
  }
}

textSizeButtons.forEach((button) => {
  button.addEventListener('click', () => setTextScale(button.dataset.textScale));
});

let savedScale = null;

try {
  savedScale = localStorage.getItem(STORED_SCALE);
} catch (error) {
  savedScale = null;
}

if (savedScale) {
  setTextScale(savedScale);
}
