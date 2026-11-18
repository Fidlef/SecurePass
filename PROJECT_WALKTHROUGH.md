# SecurePass walkthrough

This is a short guide for understanding and honestly explaining the project.

## The main idea

SecurePass separates **serving the webpage** from **handling secrets**. Flask
delivers HTML, CSS, and JavaScript, but the password never goes back to Flask.
The browser performs the analysis locally. That reduces the amount of sensitive
data the server could expose, store, or accidentally log.

## What each part does

- `app.py` creates the Flask app, serves two read-only routes, and adds security
  headers. `connect-src 'none'` blocks JavaScript from making network requests.
- `static/js/security.js` contains the strength checks, entropy estimate,
  cryptographic random selection, and password generation logic.
- `static/js/app.js` connects that logic to the buttons, fields, meter, and
  accessibility messages in the interface.
- `templates/index.html` contains the semantic page structure.
- `static/css/styles.css` creates the responsive visual design.
- `tests/test_app.py` proves the routes work, the headers exist, and Flask
  rejects a posted password.
- `tests/security.test.mjs` tests weak-pattern penalties, generator settings,
  required character categories, and rejection sampling.

## Three technical choices to explain

### 1. Why not send the password to Flask?

There is no need. Analysis can happen in the browser, so transmitting a secret
would add risk without adding value. The server intentionally has no `POST`
route.

### 2. Why use `crypto.getRandomValues`?

`Math.random()` is designed for simulations and interface effects, not secret
generation. Web Crypto provides random values suitable for security-sensitive
uses. The helper also uses rejection sampling so mapping random numbers to a
character set does not make some characters slightly more likely than others.

### 3. Why call the strength result an estimate?

Password cracking depends on attack hardware, hashing, leaks, rate limits, and
what an attacker knows about the person. SecurePass detects some obvious
patterns and calculates an educational estimate, but it cannot prove that a
password is safe.

## A truthful 30-second demo

> SecurePass is an AI-assisted defensive cybersecurity project I reviewed and
> tested. It analyzes password structure and generates passwords entirely in
> the browser, so the Flask server never receives the secret. I used Web Crypto
> instead of `Math.random`, added rejection sampling to avoid selection bias,
> blocked outbound browser connections with a Content Security Policy, and
> tested both the privacy headers and the generator. The score is clearly
> presented as an estimate, not a guarantee.

Only say you personally reviewed, changed, or understood a part after you have
actually done so. The repository README includes the full AI-assistance
disclosure.

## Questions you should be ready to answer

1. What is the difference between secure randomness and ordinary randomness?
2. Why does the application avoid a password-submission route?
3. What can a Content Security Policy prevent?
4. Why are entropy and crack-time figures not guarantees?
5. What would you improve next?

A strong next improvement would be a locally bundled, mature estimator such as
zxcvbn, followed by more browser-level accessibility and security tests. It
should still run without sending the password to a remote API.
