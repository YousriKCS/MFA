const CREDS = { email: 'john@example.com', password: 'Summer2023' };
const MAX_TRIES = 3;
const TOTP_SECONDS = 30;

const BALANCE = '€4,820.15';

const SIGNED_IN = {
  breached: true,
  resultTitle: 'Signed in',
  resultText: 'Welcome back, John. Opening your accounts...',
};

const BLOCKED = {
  breached: false,
  resultTitle: 'Sign-in stopped',
  resultText: 'We couldn\'t confirm it was you. Sign-in stopped.',
};

const OUTCOMES = {
  text: {
    peeked: {
      ...SIGNED_IN,
      title: 'You got in.',
      text: 'You only managed that by opening John\'s phone and reading the number off it. That phone is in his pocket, in another city. Nothing you stole gives you a way to see it.',
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
      text: 'The number was sent to John\'s phone. You never see his phone, so a stolen password on its own gets you nowhere.',
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
      text: 'John tapped "Yes" without reading it, out of habit. Nothing was cracked and nothing was guessed. That one tap let you straight in.',
      lesson: 'Never tap "Yes" until you have read where the login is coming from.',
    },
    fatigued: {
      ...SIGNED_IN,
      title: 'You got in by wearing him down.',
      text: 'You sent the same request over and over until his phone would not stop buzzing. In the end John tapped "Yes" to make it stop. Nothing was cracked and nothing was guessed. He was simply worn out. This is how Uber was broken into in 2022.',
      lesson: 'If your phone will not stop asking, that is the attack. Tap No and change your password.',
    },
    denied: {
      ...BLOCKED,
      title: 'The break-in was stopped.',
      text: 'John read the message, saw a login he never started coming from a strange place, and tapped "No". You were locked out.',
      lesson: 'If a login pops up and you did not start it, always tap "No".',
    },
  },

  match: {
    approved: {
      ...SIGNED_IN,
      title: 'You got in.',
      text: 'John tapped the right number. The only way he could know it was if someone read it out to him, and the only person with that number was you. A caller saying they are from the bank, asking you to read or confirm a number, is the attack itself.',
      lesson: 'Your bank will never ring you and ask for the number. If someone does, put the phone down.',
    },
    wrongnumber: {
      ...BLOCKED,
      title: 'The break-in was stopped.',
      text: 'John tapped a number, but not yours. He had three to choose from and no way of knowing which one sat on your screen, so the bank refused the sign-in. Asking again just gave him three fresh numbers.',
      lesson: 'When your bank shows you numbers to choose from, only tap one if you are looking at the screen you started the login on.',
    },
    denied: {
      ...BLOCKED,
      title: 'The break-in was stopped.',
      text: 'John saw a sign-in he never started, from a city he has never visited, and refused it. No number was ever tapped.',
      lesson: 'If a login pops up and you did not start it, always tap "No".',
    },
  },
};

const PUSH_COPY = {
  popup: {
    waitNote: 'We sent a request to his phone. He only has to tap Yes.',
    sub: 'Only tap "Yes" if you started this yourself.',
    footnote: 'You are John now. He is at home and did not try to log in. What should he tap?',
  },
  match: {
    waitNote: 'We sent a request to his phone. He has to tap the number below.',
    sub: 'Tap the number shown on the screen you are signing in on.',
    footnote: 'You are John now. You did not start this, and you cannot see the attacker\'s screen. Which number is his?',
  },
};

const FATIGUE_FOOTNOTE = 'You are John now. Your phone has buzzed over and over. You did not start any of this and you just want it to stop.';

const STEPS = {
  1: 'Step 1 of 2; sign in with the stolen password',
  2: 'Step 2 of 2; get past the second check',
  3: 'Done',
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
const phoneDock = document.getElementById('phone-dock');
const phoneToggle = document.getElementById('phone-toggle');
const phoneIdle = document.getElementById('phone-idle');
const phoneSms = document.getElementById('phone-sms');
const phoneApp = document.getElementById('phone-app');
const phonePush = document.getElementById('phone-push');
const smsCode = document.getElementById('sms-code');
const appCode = document.getElementById('app-code');
const appBar = document.getElementById('app-bar');
const appSeconds = document.getElementById('app-seconds');
const waitNote = document.getElementById('wait-note');
const matchBox = document.getElementById('match-box');
const pushSub = document.getElementById('push-sub');
const pushPlain = document.getElementById('push-plain');
const pushMatch = document.getElementById('push-match');
const pushCount = document.getElementById('push-count');
const pushFootnote = document.getElementById('push-footnote');
const numberChoices = document.getElementById('number-choices');
const fatigueNote = document.getElementById('fatigue-note');
const accountCard = document.getElementById('account-card');
const accountBalance = document.getElementById('account-balance');
const accountDone = document.getElementById('account-done');
const outcome = document.getElementById('outcome');
const outcomeTitle = document.getElementById('outcome-title');
const outcomeText = document.getElementById('outcome-text');
const outcomeLesson = document.getElementById('outcome-lesson');

let selectedMfa = 'text';
let sentCode = null;
let phoneRevealed = false;
let pushRequests = 0;
let matchValue = null;
let triesLeft = MAX_TRIES;
let totpTimer = null;
let totpLeft = TOTP_SECONDS;

const stepBars = document.querySelectorAll('.step-bar');
const stepLabel = document.getElementById('step-label');

function setStep(step) {
  stepLabel.textContent = STEPS[step];

  stepBars.forEach((bar) => {
    bar.classList.toggle('on', Number(bar.dataset.step) <= step);
  });
}

function randomNumber() {
  return String(10 + Math.floor(Math.random() * 90));
}

function drawNumberChoices() {
  const options = [matchValue];

  while (options.length < 3) {
    const candidate = randomNumber();

    if (!options.includes(candidate)) {
      options.push(candidate);
    }
  }

  options.sort(() => Math.random() - 0.5);
  numberChoices.innerHTML = '';

  options.forEach((value) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = value;
    button.addEventListener('click', () => {
      finish(value === matchValue ? 'approved' : 'wrongnumber');
    });
    numberChoices.appendChild(button);
  });
}

function drawPushState() {
  const matching = selectedMfa === 'match';

  if (pushRequests > 1) {
    pushCount.textContent = `${pushRequests} requests in the last two minutes`;
    pushCount.hidden = false;
  } else {
    pushCount.hidden = true;
  }

  pushFootnote.textContent = pushRequests >= 3 && !matching
    ? FATIGUE_FOOTNOTE
    : PUSH_COPY[selectedMfa].footnote;
}

function startPush() {
  const matching = selectedMfa === 'match';
  const copy = PUSH_COPY[selectedMfa];

  pushRequests = 1;
  waitNote.textContent = copy.waitNote;
  pushSub.textContent = copy.sub;
  matchBox.hidden = !matching;
  pushPlain.hidden = matching;
  pushMatch.hidden = !matching;
  numberChoices.hidden = !matching;

  if (matching) {
    matchValue = randomNumber();
    matchNumber.textContent = matchValue;
    drawNumberChoices();
  }

  drawPushState();
}

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
  accountCard.hidden = !result.breached;
  outcome.hidden = false;
  setStep(3);
}

function reset() {
  stopTotp();

  sentCode = null;
  phoneRevealed = false;
  pushRequests = 0;
  matchValue = null;
  triesLeft = MAX_TRIES;

  pushCount.hidden = true;
  fatigueNote.textContent = 'He has not answered. You can keep asking.';

  emailInput.value = '';
  passwordInput.value = '';
  codeInput.value = '';

  accountBalance.textContent = BALANCE;
  accountDone.hidden = true;

  loginError.hidden = true;
  codeError.hidden = true;
  outcome.hidden = true;
  accountCard.hidden = true;
  resultCard.hidden = true;
  codeForm.hidden = true;
  waitCard.hidden = true;
  loginForm.hidden = false;

  phoneSms.hidden = true;
  phoneApp.hidden = true;
  phonePush.hidden = true;
  phoneIdle.hidden = false;
  setPhoneDock(false);
  setStep(1);
}

function fitLaptop() {
  const available = window.innerWidth - 48;
  const scale = Math.max(0.35, Math.min(1, available / 1414));
  document.documentElement.style.setProperty('--laptop-scale', scale.toFixed(3));
}

fitLaptop();
window.addEventListener('resize', fitLaptop);

function setPhoneDock(up) {
  phoneDock.classList.toggle('up', up);
  phoneToggle.setAttribute('aria-expanded', String(up));
  phoneToggle.innerHTML = up ? '<b>Put the phone down</b>' : "<b>Look at John's phone</b>";
}

phoneToggle.addEventListener('click', () => {
  const up = !phoneDock.classList.contains('up');

  if (up) {
    phoneRevealed = true;
  }

  setPhoneDock(up);
});

picker.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-mfa]');
  if (!button) return;

  selectedMfa = button.dataset.mfa;

  picker.querySelectorAll('button').forEach((other) => {
    const chosen = other === button;
    other.classList.toggle('w3-black', chosen);
    other.classList.toggle('w3-white', !chosen);
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
  setStep(2);

  if (selectedMfa === 'popup' || selectedMfa === 'match') {
    startPush();
    phonePush.hidden = false;
    waitCard.hidden = false;
    setPhoneDock(true);
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

document.getElementById('transfer').addEventListener('click', () => {
  accountBalance.textContent = '€0.00';
  accountDone.textContent = `${BALANCE} sent to an account you control. John finds out tomorrow.`;
  accountDone.hidden = false;
});

document.getElementById('statements').addEventListener('click', () => {
  accountDone.textContent = 'Every payment John has made for the last two years is now yours to read.';
  accountDone.hidden = false;
});

document.getElementById('send-again').addEventListener('click', () => {
  pushRequests += 1;

  if (selectedMfa === 'match') {
    matchValue = randomNumber();
    matchNumber.textContent = matchValue;
    drawNumberChoices();
    fatigueNote.textContent = 'A new request, and a new number. He still cannot see your screen.';
  }

  drawPushState();
});

document.getElementById('push-allow').addEventListener('click', () => {
  finish(pushRequests >= 3 ? 'fatigued' : 'approved');
});

document.getElementById('push-deny').addEventListener('click', () => finish('denied'));
document.getElementById('match-deny').addEventListener('click', () => finish('denied'));
document.getElementById('restart').addEventListener('click', reset);
document.getElementById('try-other').addEventListener('click', reset);

setStep(1);
