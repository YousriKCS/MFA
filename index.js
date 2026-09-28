const CREDS = { email: 'joren@example.com', password: 'Summer2023' };
const MAX_TRIES = 3;

const OUTCOMES = {
  peeked: {
    resultTitle: 'Signed in',
    resultText: 'Welcome back, Joren. Opening your accounts...',
    title: 'You got in.',
    text: 'You only managed that by opening Joren\'s phone and reading the number off it. That phone is in his pocket, in another city. Nothing you stole gives you a way to see it.',
    lesson: 'A stolen password is not enough when the code lands on a phone you do not have.',
  },
  guessed: {
    resultTitle: 'Signed in',
    resultText: 'Welcome back, Joren. Opening your accounts...',
    title: 'You got in, by pure luck.',
    text: 'You guessed the number without looking. There are 900,000 six-digit codes, so that was a 1 in 900,000 shot, and the bank locks the account after three wrong tries. Nothing was cracked. You won a lottery.',
    lesson: 'Even a texted code turns a stolen password into a locked door.',
  },
  stopped: {
    resultTitle: 'Sign-in stopped',
    resultText: 'We couldn\'t confirm it was you. Sign-in stopped.',
    title: 'The break-in was stopped.',
    text: 'The number was sent to Joren\'s phone. You never see his phone, so a stolen password on its own gets you nowhere.',
    lesson: 'A stolen password is not enough when a code goes to your own phone.',
  },
};

const picker = document.querySelector('.mfa-picker');
const loginForm = document.getElementById('login-form');
const codeForm = document.getElementById('code-form');
const resultCard = document.getElementById('result-card');
const resultTitle = document.getElementById('result-title');
const resultText = document.getElementById('result-text');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const codeInput = document.getElementById('code');
const loginError = document.getElementById('login-error');
const codeError = document.getElementById('code-error');
const phoneCover = document.getElementById('phone-cover');
const phoneScreen = document.getElementById('phone-screen');
const phoneIdle = document.getElementById('phone-idle');
const phoneSms = document.getElementById('phone-sms');
const smsCode = document.getElementById('sms-code');
const outcome = document.getElementById('outcome');
const outcomeTitle = document.getElementById('outcome-title');
const outcomeText = document.getElementById('outcome-text');
const outcomeLesson = document.getElementById('outcome-lesson');

let selectedMfa = 'text';
let sentCode = null;
let phoneRevealed = false;
let triesLeft = MAX_TRIES;

function finish(key) {
  const result = OUTCOMES[key];

  resultTitle.textContent = result.resultTitle;
  resultText.textContent = result.resultText;
  outcomeTitle.textContent = result.title;
  outcomeText.textContent = result.text;
  outcomeLesson.textContent = result.lesson;

  codeForm.hidden = true;
  resultCard.hidden = false;
  outcome.hidden = false;
}

function reset() {
  sentCode = null;
  phoneRevealed = false;
  triesLeft = MAX_TRIES;

  emailInput.value = '';
  passwordInput.value = '';
  codeInput.value = '';

  loginError.hidden = true;
  codeError.hidden = true;
  outcome.hidden = true;
  resultCard.hidden = true;
  codeForm.hidden = true;
  loginForm.hidden = false;
  phoneSms.hidden = true;
  phoneIdle.hidden = false;
  phoneScreen.hidden = true;
  phoneCover.hidden = false;
}

document.getElementById('reveal-phone').addEventListener('click', () => {
  phoneRevealed = true;
  phoneCover.hidden = true;
  phoneScreen.hidden = false;
});

picker.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-mfa]');
  if (!button) return;

  selectedMfa = button.dataset.mfa;

  picker.querySelectorAll('button').forEach((other) => {
    other.classList.toggle('active', other === button);
  });
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const emailMatches = emailInput.value.trim().toLowerCase() === CREDS.email;
  const passwordMatches = passwordInput.value === CREDS.password;

  if (!emailMatches || !passwordMatches) {
    loginError.textContent = 'Wrong email or password.';
    loginError.hidden = false;
    return;
  }

  if (selectedMfa !== 'text') {
    loginError.textContent = 'Only "Code by text" is built so far.';
    loginError.hidden = false;
    return;
  }

  sentCode = String(Math.floor(100000 + Math.random() * 900000));
  smsCode.textContent = sentCode;

  loginError.hidden = true;
  loginForm.hidden = true;
  codeForm.hidden = false;
  phoneIdle.hidden = true;
  phoneSms.hidden = false;
  codeInput.focus();
});

codeForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (codeInput.value.trim() === sentCode) {
    finish(phoneRevealed ? 'peeked' : 'guessed');
    return;
  }

  triesLeft -= 1;

  if (triesLeft === 0) {
    finish('stopped');
    return;
  }

  codeError.textContent = `That code is not right. ${triesLeft} ${triesLeft === 1 ? 'try' : 'tries'} left before the account locks.`;
  codeError.hidden = false;
  codeInput.value = '';
  codeInput.focus();
});

document.getElementById('restart').addEventListener('click', reset);
document.getElementById('try-other').addEventListener('click', reset);
