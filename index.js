const CREDS = { email: 'joren@example.com', password: 'Summer2023' };
const MAX_TRIES = 3;
const TOTP_SECONDS = 30;

const SIGNED_IN = {
  resultTitle: 'Signed in',
  resultText: 'Welcome back, Joren. Opening your accounts...',
};

const BLOCKED = {
  resultTitle: 'Sign-in stopped',
  resultText: 'We couldn\'t confirm it was you. Sign-in stopped.',
};

const OUTCOMES = {
  text: {
    peeked: {
      ...SIGNED_IN,
      title: 'You got in.',
      text: 'You only managed that by opening Joren\'s phone and reading the number off it. That phone is in his pocket, in another city. Nothing you stole gives you a way to see it.',
      lesson: 'A stolen password is not enough when the code lands on a phone you do not have.',
    },
    guessed: {
      ...SIGNED_IN,
      title: 'You got in, by pure luck.',
      text: 'You guessed the number without looking. There are 900,000 six-digit codes, so that was a 1 in 900,000 shot, and the bank locks the account after three wrong tries. Nothing was cracked. You won a lottery.',
      lesson: 'Even a texted code turns a stolen password into a locked door.',
    },
    stopped: {
      ...BLOCKED,
      title: 'The break-in was stopped.',
      text: 'The number was sent to Joren\'s phone. You never see his phone, so a stolen password on its own gets you nowhere.',
      lesson: 'A stolen password is not enough when a code goes to your own phone.',
    },
  },

  app: {
    peeked: {
      ...SIGNED_IN,
      title: 'You got in.',
      text: 'You read the number straight off his screen. In real life that app sits behind his lock screen, and you would need the phone in your hand to see it.',
      lesson: 'An app code is never sent anywhere, so there is nothing for a hacker to catch.',
    },
    guessed: {
      ...SIGNED_IN,
      title: 'You got in, by pure luck.',
      text: 'A 1 in 900,000 guess, and the number would have changed within 30 seconds anyway. Nothing was cracked.',
      lesson: 'App codes change every 30 seconds, so even a lucky guess goes stale.',
    },
    stopped: {
      ...BLOCKED,
      title: 'The break-in was stopped.',
      text: 'The number is made on his phone and replaced every 30 seconds. It is never texted, never emailed, never sent at all, so there was never a message for you to steal.',
      lesson: 'A code that never leaves the phone cannot be intercepted.',
    },
  },

  popup: {
    approved: {
      ...SIGNED_IN,
      title: 'You got in.',
      text: 'Joren tapped "Yes" without reading it, out of habit. Nothing was cracked and nothing was guessed. That one tap let you straight in.',
      lesson: 'Never tap "Yes" until you have read where the login is coming from.',
    },
    denied: {
      ...BLOCKED,
      title: 'The break-in was stopped.',
      text: 'Joren read the message, saw a login he never started coming from a strange place, and tapped "No". You were locked out.',
      lesson: 'If a login pops up and you did not start it, always tap "No".',
    },
  },
};

const CODE_NOTES = {
  text: 'We texted a 6-digit code to the phone ending 4471.',
  app: 'Enter the number from his safety app.',
};

const picker = document.querySelector('.mfa-picker');
const loginForm = document.getElementById('login-form');
const codeForm = document.getElementById('code-form');
const codeNote = document.getElementById('code-note');
const waitCard = document.getElementById('wait-card');
const matchNumber = document.getElementById('match-number');
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
const phoneApp = document.getElementById('phone-app');
const phonePush = document.getElementById('phone-push');
const smsCode = document.getElementById('sms-code');
const appCode = document.getElementById('app-code');
const appBar = document.getElementById('app-bar');
const appSeconds = document.getElementById('app-seconds');
const pushNumber = document.getElementById('push-number');
const outcome = document.getElementById('outcome');
const outcomeTitle = document.getElementById('outcome-title');
const outcomeText = document.getElementById('outcome-text');
const outcomeLesson = document.getElementById('outcome-lesson');

let selectedMfa = 'text';
let sentCode = null;
let phoneRevealed = false;
let triesLeft = MAX_TRIES;
let totpTimer = null;
let totpLeft = TOTP_SECONDS;

function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function drawTotp() {
  appCode.textContent = `${sentCode.slice(0, 3)} ${sentCode.slice(3)}`;
  appSeconds.textContent = totpLeft;
  appBar.style.width = `${(totpLeft / TOTP_SECONDS) * 100}%`;
}

function startTotp() {
  sentCode = randomCode();
  totpLeft = TOTP_SECONDS;
  drawTotp();

  totpTimer = setInterval(() => {
    totpLeft -= 1;

    if (totpLeft <= 0) {
      sentCode = randomCode();
      totpLeft = TOTP_SECONDS;
    }

    drawTotp();
  }, 1000);
}

function stopTotp() {
  clearInterval(totpTimer);
  totpTimer = null;
}

function finish(key) {
  const result = OUTCOMES[selectedMfa][key];

  stopTotp();

  resultTitle.textContent = result.resultTitle;
  resultText.textContent = result.resultText;
  outcomeTitle.textContent = result.title;
  outcomeText.textContent = result.text;
  outcomeLesson.textContent = result.lesson;

  codeForm.hidden = true;
  waitCard.hidden = true;
  resultCard.hidden = false;
  outcome.hidden = false;
}

function reset() {
  stopTotp();

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
  waitCard.hidden = true;
  loginForm.hidden = false;

  phoneSms.hidden = true;
  phoneApp.hidden = true;
  phonePush.hidden = true;
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

  reset();
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

  loginError.hidden = true;
  loginForm.hidden = true;
  phoneIdle.hidden = true;

  if (selectedMfa === 'popup') {
    pushNumber.textContent = String(Math.floor(10 + Math.random() * 90));
    matchNumber.textContent = pushNumber.textContent;
    phonePush.hidden = false;
    waitCard.hidden = false;
    return;
  }

  if (selectedMfa === 'app') {
    startTotp();
    phoneApp.hidden = false;
  } else {
    sentCode = randomCode();
    smsCode.textContent = sentCode;
    phoneSms.hidden = false;
  }

  codeNote.textContent = CODE_NOTES[selectedMfa];
  codeForm.hidden = false;
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

document.getElementById('push-allow').addEventListener('click', () => finish('approved'));
document.getElementById('push-deny').addEventListener('click', () => finish('denied'));
document.getElementById('restart').addEventListener('click', reset);
document.getElementById('try-other').addEventListener('click', reset);
