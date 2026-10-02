# MFA Safety Training

A small static site that teaches older adults what multi-factor authentication
is for, by letting them play both sides of it.

Open `index.html` in any browser. There is no build step and no server.

## The two simulators

**Attack Simulator** (`attack-info.html` → `attack-simulator.html`)
You are the attacker. You have John's email and password from a breach dump, and
you pick which second check stands in your way: a code by text, a code in an
app, a Yes / No popup, or a popup with a number. You can pull up John's phone,
which a real attacker could never do, and the outcome tells you whether that is
the only reason you got in.

**Authentication Request Simulator** (`mfa-info.html` → `auth-request-sim.html`)
You are the person holding the phone. Seven requests arrive. Beside each one the
page shows what you are actually doing at that moment — where you are, what
device is in your hands, whether you started a sign-in at all — and you decide
yes or no. The requests are built so that location alone never answers the
question.

## Accessibility

Every page carries a text-size control (Normal / Larger / Largest) that scales
the whole interface, including the device mockups, and remembers the choice in
`localStorage`. The preference is applied in `<head>` before first paint. Pages
have a skip link, a single `h1`, landmark elements, and live regions so that
decisions and results are announced. Colours are checked against WCAG AA.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Homepage, picks a simulator |
| `attack-info.html`, `mfa-info.html` | Briefing pages |
| `attack-simulator.html`, `index.js` | Attack Simulator |
| `auth-request-sim.html`, `script.js` | Authentication Request Simulator |
| `style.css` | Everything except the request simulator |
| `auth-sim.css` | The request simulator |
| `accessibility.js` | Text-size control, shared by every page |
| `w3.css` | W3.CSS, vendored |
| `montserrat-latin.woff2` | Montserrat, SIL Open Font License |

The laptop and phone mockups are adapted from the W3Schools device CSS
(https://www.w3schools.com/HOWTO/howto_css_devices.asp).
