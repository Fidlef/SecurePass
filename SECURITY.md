# Security policy

## Privacy model

SecurePass is designed so password values stay inside the browser tab. The
Flask server exposes only `GET /` and `GET /health`; it has no endpoint that
accepts passwords. A Content Security Policy blocks all browser network
connections (`connect-src 'none'`), third-party scripts, framing, and forms.
Responses use `Cache-Control: no-store`.

The estimator is zxcvbn 4.4.2 bundled into the application, so analysis does not
require a CDN or remote API. The generator uses Web Crypto
(`crypto.getRandomValues`) and rejection sampling to avoid modulo bias. It does
not use `Math.random`.

## Reporting a vulnerability

Please open a GitHub security advisory rather than a public issue when the
repository owner enables private vulnerability reporting. Do not include real
passwords, credentials, API keys, or other secrets in a report.

## Scope and limitations

- zxcvbn is an estimator, not a full password-cracking model or safety verdict.
- Entropy and offline-guess times are estimates. Real attacks depend on the
  hashing algorithm, hardware, attacker knowledge, leaks, and rate limits.
- This tool does not check breach databases because doing so would add network
  and privacy complexity. Check important passwords through a trusted breach
  service using a privacy-preserving protocol, and never submit the full value.
- A compromised browser, extension, operating system, or clipboard can still
  expose a password. SecurePass does not protect an already-compromised device.
- Generated passwords should be stored in a reputable password manager and
  never reused across accounts.
