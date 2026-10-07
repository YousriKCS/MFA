const People = [
	{
		email: "anna.olsson@email.com",
		home: "Stockholm, Sweden",
		laptop: { dev: "Windows 11 laptop", browser: "Chrome", word: "laptop" },
		phone: { dev: "iPhone 15", browser: "Safari", word: "phone" }
	},
	{
		email: "erik.lind@email.com",
		home: "Malmo, Sweden",
		laptop: { dev: "MacBook Air", browser: "Safari", word: "laptop" },
		phone: { dev: "Samsung Galaxy", browser: "Chrome", word: "phone" }
	},
	{
		email: "britta.hall@email.com",
		home: "Jonkoping, Sweden",
		laptop: { dev: "Windows 10 desktop", browser: "Edge", word: "computer" },
		phone: { dev: "iPhone 13", browser: "Safari", word: "phone" }
	},
	{
		email: "lars.nyberg@email.com",
		home: "Gothenburg, Sweden",
		laptop: { dev: "Windows 11 laptop", browser: "Firefox", word: "laptop" },
		phone: { dev: "Google Pixel", browser: "Chrome", word: "phone" }
	}
];

const HolidayCities = [
	{ name: "Barcelona", full: "Barcelona, Spain" },
	{ name: "Rome", full: "Rome, Italy" },
	{ name: "Lisbon", full: "Lisbon, Portugal" },
	{ name: "Edinburgh", full: "Edinburgh, Scotland" },
	{ name: "Krakow", full: "Krakow, Poland" }
];

const FarCities = [
	"Moscow, Russia",
	"Lagos, Nigeria",
	"Los Angeles, USA",
	"Hanoi, Vietnam",
	"Sao Paulo, Brazil"
];

const StrangeDevices = [
	{ dev: "Android phone", browser: "Brave" },
	{ dev: "Linux computer", browser: "Tor Browser" },
	{ dev: "Windows 7 computer", browser: "Firefox" },
	{ dev: "Chromebook", browser: "Opera" }
];

const DayTimes = ["09:30", "11:20", "14:05", "16:45", "17:10"];
const EveningTimes = ["20:05", "21:40", "22:15", "22:50"];
const NightTimes = ["02:48", "03:12", "03:55", "04:20"];

const EveningIdle = [
	"Your phone is in your pocket. You are not signing in to anything.",
	"You are reading a book. You have not touched a computer all evening.",
	"You are watching television. Nothing of yours is signing in.",
	"You are cooking dinner. Your laptop is shut."
];

const NightIdle = [
	"You are asleep. The buzzing woke you up.",
	"You have been in bed for an hour. Nothing of yours is signing in."
];

const pick = list => list[Math.floor(Math.random() * list.length)];

function shuffle(list) {
	const out = list.slice();
	for (let k = out.length - 1; k > 0; k--) {
		const j = Math.floor(Math.random() * (k + 1));
		[out[k], out[j]] = [out[j], out[k]];
	}
	return out;
}

function ordinal(n) {
	const tail = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th";
	return `${n}${tail}`;
}

const Cases = {
	ownLaptop(you) {
		const time = pick(DayTimes);
		const here = { loc: you.home, dev: you.laptop.dev, browser: you.laptop.browser, time };
		return {
			activity: `You are signing in to your email on your own ${you.laptop.word} right now.`,
			you: here,
			request: { ...here },
			answer: "approve",
			why: "Every line matches what you are doing: your city, your device, your browser, and the time is now."
		};
	},

	ownPhone(you) {
		const time = pick(DayTimes);
		const here = { loc: you.home, dev: you.phone.dev, browser: you.phone.browser, time };
		return {
			activity: "You are at home, signing in to your email on your phone.",
			you: here,
			request: { ...here },
			answer: "approve",
			why: "Same city, the phone in your hand, the same minute. This is your own sign-in."
		};
	},

	holiday(you) {
		const city = pick(HolidayCities);
		const time = pick(DayTimes);
		const here = { loc: city.full, dev: you.phone.dev, browser: you.phone.browser, time };
		return {
			activity: `You are on holiday in ${city.name}, signing in to your email on your phone.`,
			you: here,
			request: { ...here },
			answer: "approve",
			why: `A faraway city is not a warning on its own. You are in ${city.name}, on that phone, signing in right now.`
		};
	},

	perfectTrap(you) {
		const time = pick(EveningTimes);
		const here = { loc: you.home, dev: you.laptop.dev, browser: you.laptop.browser, time };
		return {
			activity: pick(EveningIdle),
			you: here,
			request: { ...here },
			answer: "deny",
			why: "The place and the device look exactly right, and that is the trap. You did not start a sign-in, so there is nothing here to approve."
		};
	},

	strangeDevice(you) {
		const stranger = pick(StrangeDevices);
		const time = pick(EveningTimes);
		return {
			activity: pick(EveningIdle),
			you: { loc: you.home, dev: you.laptop.dev, browser: you.laptop.browser, time },
			request: { loc: you.home, dev: stranger.dev, browser: stranger.browser, time },
			answer: "deny",
			why: "Same city as you, but the device and the browser are not yours, and you started nothing."
		};
	},

	notThisOne(you) {
		const stranger = pick(StrangeDevices);
		return {
			activity: `You are signing in to your email on your own ${you.laptop.word}.`,
			you: { loc: you.home, dev: you.laptop.dev, browser: you.laptop.browser, time: pick(DayTimes) },
			request: { loc: you.home, dev: stranger.dev, browser: stranger.browser, time: pick(NightTimes) },
			answer: "deny",
			why: "You did start a sign-in, but not this one. The time is hours off and the device and browser are not yours."
		};
	},

	farAway(you) {
		const stranger = pick(StrangeDevices);
		return {
			activity: pick(NightIdle),
			you: { loc: you.home, dev: you.laptop.dev, browser: you.laptop.browser, time: pick(NightTimes) },
			request: { loc: pick(FarCities), dev: stranger.dev, browser: stranger.browser, time: pick(NightTimes) },
			answer: "deny",
			why: "Nothing here is yours: not the city, not the device, and you started no sign-in."
		};
	},

	fatigue(you) {
		const time = pick(NightTimes);
		const here = { loc: you.home, dev: you.laptop.dev, browser: you.laptop.browser, time };
		const count = 4 + Math.floor(Math.random() * 5);
		const minutes = 3 + Math.floor(Math.random() * 5);
		return {
			activity: "You went to bed an hour ago. Your phone has been buzzing all night.",
			you: here,
			request: { ...here },
			repeat: `This is the ${ordinal(count)} request in ${minutes} minutes.`,
			answer: "deny",
			why: "This is the trick that works most often. Somebody has your password and is sending request after request, hoping you tap yes just to make the buzzing stop. Say no every time, then change your password."
		};
	}
};

function buildRun() {
	const you = pick(People);
	const spare = shuffle(["strangeDevice", "notThisOne", "farAway"]).slice(0, 2);
	const rest = shuffle(["ownPhone", "holiday", "perfectTrap", "fatigue", ...spare]);
	return {
		account: you.email,
		scenarios: [Cases.ownLaptop(you), ...rest.map(name => Cases[name](you))]
	};
}

let run = buildRun();
let Scenarios = run.scenarios;

const Outcomes = {
	"approve-approve": {
		icon: "✅",
		cls: "green",
		title: "You are signed in",
		text: "Your email opens on the device you were already using."
	},
	"approve-deny": {
		icon: "⚠️",
		cls: "red",
		title: "Someone else is in",
		text: "You approved a sign-in you never started, so a stranger now has your email."
	},
	"deny-deny": {
		icon: "🛡️",
		cls: "green",
		title: "Request refused",
		text: "Nobody got in. Your password alone was not enough."
	},
	"deny-approve": {
		icon: "🔒",
		cls: "amber",
		title: "Your own sign-in blocked",
		text: "You refused a request you had started, so the sign-in failed. No harm done, just try again."
	}
};

const Words = { approve: "yes, it is me", deny: "no, not me" };

let i = 0;
let round = 0;
const results = [];

const $ = id => document.getElementById(id);
const show = id => $(id).classList.remove("hidden");
const hide = id => $(id).classList.add("hidden");
const hideAll = (...ids) => ids.forEach(hide);

Scenarios.forEach(() => {
	const bar = document.createElement("span");
	bar.className = "step-bar";
	$("step-bars").appendChild(bar);
});

function updateProgress() {
	const n = Math.min(i + 1, Scenarios.length);
	const correct = results.filter(r => r.correct).length;

	$("hero-sub").textContent = `Request ${n} of ${Scenarios.length}; compare it with what you are doing.`;
	$("step-bars").setAttribute(
		"aria-label",
		results.length
			? `Progress: ${results.length} of ${Scenarios.length} answered, ${correct} correct`
			: "No requests answered yet"
	);

	$("step-bars").querySelectorAll(".step-bar").forEach((bar, k) => {
		const done = results[k];
		bar.classList.toggle("on", k < results.length);
		bar.classList.toggle("right", Boolean(done) && done.correct);
		bar.classList.toggle("wrong", Boolean(done) && !done.correct);
	});
}

function setFeedback(text, cls = "") {
	$("feedbackBlock").className = "feedback " + cls;
	$("feedback").textContent = text;
}

function loadScenario() {
	const s = Scenarios[i];
	round++;
	const token = round;

	hideAll("pNotif", "pResult", "nextBtn");
	show("pIdle");

	$("cActivity").textContent = s.activity;
	$("cLoc").textContent = s.you.loc;
	$("cDev").textContent = s.you.dev;
	$("cBrowser").textContent = s.you.browser;
	$("cTime").textContent = s.you.time;

	updateProgress();
	setFeedback("Read what you are doing, on the left. A request is on its way to your phone.");

	setTimeout(() => {
		if (token === round) deliverRequest();
	}, 1600);
}

function deliverRequest() {
	const s = Scenarios[i];

	$("nUser").textContent = run.account;
	$("nLoc").textContent = s.request.loc;
	$("nDev").textContent = s.request.dev;
	$("nBrowser").textContent = s.request.browser;
	$("nTime").textContent = s.request.time;

	if (s.repeat) {
		$("nRepeat").textContent = s.repeat;
		show("nRepeat");
	} else {
		hide("nRepeat");
	}

	hide("pIdle");
	show("pNotif");
	setFeedback("A request has arrived. Read every line, then answer on your phone.");
	$("notifTitle").focus();
}

function answer(approve) {
	const s = Scenarios[i];
	const chosen = approve ? "approve" : "deny";
	const correct = chosen === s.answer;
	const outcome = Outcomes[`${chosen}-${s.answer}`];
	const last = i === Scenarios.length - 1;

	results.push({ s, chosen, correct });

	hide("pNotif");
	$("rIcon").textContent = outcome.icon;
	$("rTitle").textContent = outcome.title;
	$("rTitle").className = outcome.cls;
	$("rText").textContent = outcome.text;
	show("pResult");

	setFeedback(`${correct ? "Correct." : "Not quite."} ${s.why}`, correct ? "correct" : "wrong");

	$("nextBtn").textContent = last ? "See how you did" : "Next request";
	show("nextBtn");
	$("nextBtn").focus();

	updateProgress();
}

function next() {
	i++;
	if (i >= Scenarios.length) showSummary();
	else loadScenario();
}

function showSummary() {
	round++;
	hideAll("stage", "feedbackBlock", "nextBtn");

	$("hero-sub").textContent = "Here's how you did.";

	const correct = results.filter(r => r.correct).length;
	$("score").textContent = `${correct} / ${Scenarios.length}`;

	const v = $("verdict");

	if (correct === Scenarios.length) {
		v.className = "verdict excellent";
		v.textContent = "Excellent, you answered every request correctly";
	} else if (correct >= Scenarios.length / 2) {
		v.className = "verdict good";
		v.textContent = "Good, a couple of requests took you off guard";
	} else {
		v.className = "verdict poor";
		v.textContent = "Needs practice, read the explanations below";
	}

	$("list").innerHTML = results.map((r, k) => `
		<li>
			<span class="mark ${r.correct ? "right" : "wrong"}" aria-hidden="true">${r.correct ? "✓" : "✕"}</span>
			<div>
				<b>Request ${k + 1} &mdash; ${r.s.request.loc}</b><br>
				You answered <b>${Words[r.chosen]}</b>. Correct answer: <b>${Words[r.s.answer]}</b>.<br>
				${r.s.why}
			</div>
		</li>`).join("");

	show("summary");
	$("summaryTitle").focus();
}

function restart() {
	run = buildRun();
	Scenarios = run.scenarios;
	i = 0;
	results.length = 0;
	hide("summary");
	show("stage");
	show("feedbackBlock");
	loadScenario();
}

$("approveBtn").addEventListener("click", () => answer(true));
$("denyBtn").addEventListener("click", () => answer(false));
$("nextBtn").addEventListener("click", next);
$("restartBtn").addEventListener("click", restart);

loadScenario();
