const Scenarios = [
	{ loc: "Stockholm, Sweden", known: true,  ip: "192.168.1.42",  dev: "Windows 11", browser: "Chrome",      time: "Just now", answer: "approve", why: "Same city, same device, moments after your own sign-in." },
	{ loc: "Moscow, Russia",    known: false, ip: "45.83.12.201",  dev: "Android 11", browser: "Brave",       time: "07:26",    answer: "deny",    why: "Unknown device, not the same city as user, different time zone." },
	{ loc: "Lagos, Nigeria",    known: false, ip: "102.89.34.77",  dev: "Linux",      browser: "Tor browser", time: "18:39",    answer: "deny",    why: "Unknown device, not the same city as user, different time zone." },
	{ loc: "Malmo, Sweden",     known: true,  ip: "192.168.1.42",  dev: "Windows 11", browser: "Chrome",      time: "Just now", answer: "approve", why: "Same city, same device, moments after your own sign-in." },
	{ loc: "Los Angeles, USA",  known: false, ip: "185.220.101.7", dev: "iPhone 15",  browser: "Safari",      time: "16:02",    answer: "deny",    why: "Unknown device, not the same city as user, different time zone." },
	{ loc: "Amsterdam, NL",     known: false, ip: "45.83.12.205",  dev: "Windows 10", browser: "Edge",        time: "05:26",    answer: "deny",    why: "Unknown device, not the same city as user, different time zone." }
];

let i = 0;
const results = [];

const $ = id => document.getElementById(id);
const show = id => $(id).classList.remove("hidden");
const hide = id => $(id).classList.add("hidden");
const hideAll = (...ids) => ids.forEach(hide);

function updateProgress() {
	const n = Math.min(i + 1, Scenarios.length);
	const correct = results.filter(r => r.correct).length;
	$("hero-sub").textContent = `Scenario ${n} of ${Scenarios.length} - Read the request carefully.`;
	$("fill").style.width = `${(results.length / Scenarios.length) * 100}%`;
	$("fill").title = `Score ${correct} / ${results.length}`;
}

function setFeedback(html, cls = "") {
	$("feedback").className = "feedback " + cls;
	$("feedback").innerHTML = html;
}

function loadScenario() {
	hideAll("p1Sending","p1Sent","p1Approved","p1Denied","p2Notif","p2Approved","p2Denied");
	show("p1Login");
	show("p2Idle");
	$("username").value = "";
	$("password").value = "";
	$("loginBtn").disabled = false;
	updateProgress();
	setFeedback("Press the Sign in button on the attacker's phone to begin");
}

function startLogin() {
	$("loginBtn").disabled = true;
	setFeedback("Credentials being entered...");
	const u = $("username"), p = $("password");
	u.value = "";
	p.value = "";

	let a = 0;
	const t1 = setInterval(() => {
		u.value += "student"[a++];
		if (a >= 7) { clearInterval(t1); typePw(); }
	}, 60);

	function typePw() {
		let b = 0;
		const t2 = setInterval(() => {
			p.value += "1234"[b++];
			if (b >= 4) { clearInterval(t2); setTimeout(sendRequest, 350); }
		}, 60);
	}
}

function sendRequest() {
	const s = Scenarios[i];
	setFeedback("Waiting for approval on the victim's phone");
	hide("p1Login");
	show("p1Sending");

	setTimeout(() => {
		hide("p1Sending");
		show("p1Sent");

		$("nUser").textContent = "student";
		$("nIP").textContent = s.ip;
		$("nDev").textContent = s.dev;
		$("nBrowser").textContent = s.browser;

		["nLoc", "nTime"].forEach(id => $(id).classList.remove("unknown"));
		$("nTag").innerHTML = "";

		$("nLoc").textContent = s.loc;
		$("nTime").textContent = s.time;

		if (!s.known) {
			$("nLoc").classList.add("unknown");
			$("nTime").classList.add("unknown");
			$("nTag").innerHTML = '<span class="tag">Unknown</span>';
		}

		hide("p2Idle");
		show("p2Notif");
	}, 800);
}

function answer(approve) {
	const s = Scenarios[i];
	const chosen = approve ? "approve" : "deny";
	const correct = chosen === s.answer;

	results.push({ s, chosen, correct });

	hide("p2Notif");

	if (approve) {
		show("p2Approved");
		hide("p1Sent");
		show("p1Approved");
	} else {
		show("p2Denied");
		hide("p1Sent");
		show("p1Denied");
	}

	const last = i === Scenarios.length - 1;

	setFeedback(
		`<b>${correct ? "Correct!" : "Not quite."}</b> ${s.why}
		 <a href="#" onclick="next();return false;">${last ? "See summary →" : "Next →"}</a>`,
		correct ? "correct" : "wrong"
	);

	updateProgress();
}

function next() {
	i++;
	if (i >= Scenarios.length) showSummary();
	else loadScenario();
}

function showSummary() {
	hide("stage");
	hide("feedback");

	$("hero-sub").textContent = "Here's how you did.";

	const correct = results.filter(r => r.correct).length;
	$("score").textContent = `${correct} / ${Scenarios.length}`;

	const v = $("verdict");

	if (correct === Scenarios.length) {
		v.className = "verdict excellent";
		v.textContent = "Excellent, you spotted every risky request";
	} else if (correct >= Scenarios.length / 2) {
		v.className = "verdict good";
		v.textContent = "Good, a couple requests took you off guard";
	} else {
		v.className = "verdict poor";
		v.textContent = "Needs practice, review the explanations";
	}

	$("list").innerHTML = results.map((r, k) => `
		<li>
			<span class="mark ${r.correct ? "right" : "wrong"}">${r.correct ? "✓" : "✕"}</span>
			<div>
				<b>Scenario ${k+1} — ${r.s.loc}</b><br>
				You chose <b>${r.chosen}</b>. Correct: <b>${r.s.answer}</b>.<br>
				${r.s.why}
			</div>
		</li>`).join("");

	show("summary");
}

function restart() {
	i = 0;
	results.length = 0;
	hide("summary");
	show("stage");
	show("feedback");
	loadScenario();
}



loadScenario();