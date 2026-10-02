const ACCOUNT = "anna.olsson@email.com";

const Scenarios = [
	{
		activity: "You are signing in to your email on your own laptop right now.",
		you: { loc: "Stockholm, Sweden", dev: "Windows 11 laptop", browser: "Chrome", time: "14:05" },
		request: { loc: "Stockholm, Sweden", dev: "Windows 11 laptop", browser: "Chrome", time: "14:05" },
		answer: "approve",
		why: "Every line matches what you are doing: your city, your laptop, your browser, and the time is now."
	},
	{
		activity: "Your phone is in your pocket. You are not signing in to anything.",
		you: { loc: "Stockholm, Sweden", dev: "Windows 11 laptop", browser: "Chrome", time: "21:40" },
		request: { loc: "Stockholm, Sweden", dev: "Windows 11 laptop", browser: "Chrome", time: "21:40" },
		answer: "deny",
		why: "The place and the device look exactly right, and that is the trap. You did not start a sign-in, so there is nothing here to approve."
	},
	{
		activity: "You are on holiday in Barcelona, signing in to your email on your phone.",
		you: { loc: "Barcelona, Spain", dev: "iPhone 15", browser: "Safari", time: "10:12" },
		request: { loc: "Barcelona, Spain", dev: "iPhone 15", browser: "Safari", time: "10:12" },
		answer: "approve",
		why: "A faraway city is not a warning on its own. You are in Barcelona, on that phone, signing in right now."
	},
	{
		activity: "You are reading a book. You have not touched a computer all evening.",
		you: { loc: "Malmo, Sweden", dev: "Windows 11 laptop", browser: "Chrome", time: "22:15" },
		request: { loc: "Malmo, Sweden", dev: "Android phone", browser: "Brave", time: "22:15" },
		answer: "deny",
		why: "Same city as you, but the device and the browser are not yours, and you started nothing."
	},
	{
		activity: "You went to bed an hour ago. Your phone has been buzzing all night.",
		you: { loc: "Jonkoping, Sweden", dev: "Windows 10 desktop", browser: "Edge", time: "03:12" },
		request: { loc: "Jonkoping, Sweden", dev: "Windows 10 desktop", browser: "Edge", time: "03:12" },
		repeat: "This is the 6th request in 4 minutes.",
		answer: "deny",
		why: "This is the trick that works most often. Somebody has your password and is sending request after request, hoping you tap yes just to make the buzzing stop. Say no every time, then change your password."
	},
	{
		activity: "You are signing in to your email on your work computer.",
		you: { loc: "Jonkoping, Sweden", dev: "Windows 10 desktop", browser: "Edge", time: "09:30" },
		request: { loc: "Jonkoping, Sweden", dev: "Linux computer", browser: "Tor Browser", time: "03:14" },
		answer: "deny",
		why: "You did start a sign-in, but not this one. The time is hours off and the device and browser are not yours."
	},
	{
		activity: "You are signing in to your email on your work computer.",
		you: { loc: "Jonkoping, Sweden", dev: "Windows 10 desktop", browser: "Edge", time: "16:45" },
		request: { loc: "Jonkoping, Sweden", dev: "Windows 10 desktop", browser: "Edge", time: "16:45" },
		answer: "approve",
		why: "Same place, same work computer, same browser, same minute. This is your own sign-in."
	}
];

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

	$("nUser").textContent = ACCOUNT;
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
