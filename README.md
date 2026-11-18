# SecurePass

SecurePass is a privacy-first, local password strength analyzer and secure
password generator. The interface is served by a small Flask application, but
all password analysis and generation happens in the browser. Password values
are never sent to Flask, written to storage, logged, or shared with an API.

![SecurePass application preview](docs/securepass-demo.jpg)

## Why this project exists

Many password checkers ask users to trust a remote service with sensitive
input. SecurePass demonstrates a simpler defensive design: keep secret values
on the user's device, remove unnecessary network access, use cryptographic
randomness, and explain the limitations instead of presenting a score as proof
of safety.

## Features

- Local strength analysis with feedback for length, common patterns,
  repetition, and sequences
- Approximate entropy and offline-guess-time explanation
- Secure password generation using Web Crypto
- Bias-free random character selection through rejection sampling
- Guaranteed inclusion of each selected character category
- No analytics, cookies, external fonts, password API, or secret storage
- Strict Content Security Policy and no-store response headers
- Keyboard-friendly, responsive interface with reduced-motion support
- Python route/header tests and JavaScript analysis/generator tests

## Run locally

Requirements: Python 3.10+ and a modern browser.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python app.py
```

Open `http://127.0.0.1:5000`. Use only synthetic examples during demos. The
“Use safe demo” button loads `Demo!River-Quartz-47`, which is not a real secret.

## Run the tests

```bash
python -m pip install -r requirements-dev.txt
python -m pytest -q
npm test
```

The JavaScript test command uses Node's built-in test runner, so it does not
download npm packages.

## Architecture

```text
Browser
  ├─ security.js  analyzes and generates locally
  ├─ app.js       updates the interface
  └─ no outbound connections allowed
          ↑
          │ static GET requests only
          ↓
Flask
  ├─ GET /        serves the interface
  └─ GET /health  reports service health
```

The project intentionally has no `POST` route. The automated test suite checks
that a password cannot be posted to the server and that privacy/security
headers are present.

For a file-by-file explanation and honest demo script, read
[PROJECT_WALKTHROUGH.md](PROJECT_WALKTHROUGH.md).

## Demo examples

These values are synthetic and must not be used as real passwords:

| Example | Expected lesson |
|---|---|
| `Password1234!` | Common words and sequences reduce practical strength |
| `aaaaaaaaaaaa` | Length alone cannot rescue obvious repetition |
| `Demo!River-Quartz-47` | A longer mixed example scores better, but is public and unsafe for real use |

## Limitations

The score is a teaching aid, not a security guarantee. It is not a replacement
for a mature estimator such as zxcvbn, a password manager, multi-factor
authentication, or an organization-specific password policy. Guess-time
estimates assume an offline attacker trying 10 billion guesses per second;
actual conditions vary widely. SecurePass does not query breach databases in
order to preserve its offline privacy model. See [SECURITY.md](SECURITY.md) for
the full threat model.

## AI-assisted authorship disclosure

This project was developed with assistance from OpenAI's Codex. Codex helped
generate the initial application code, tests, interface, and documentation.
The repository owner is responsible for reviewing the code, running and
understanding the tests, making any later changes, and accurately describing
their own contribution. This repository should not be presented as work coded
independently without AI assistance.

## Responsible use

SecurePass is a defensive educational project. Never paste a real password
into screenshots, bug reports, issues, commits, or public demonstrations.

## License

[MIT](LICENSE)
