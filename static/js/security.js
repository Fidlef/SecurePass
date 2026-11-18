const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  number: "0123456789",
  symbol: "!@#$%^&*()-_=+[]{};:,.?",
};

const COMMON_PATTERNS = [
  "password", "passw0rd", "qwerty", "letmein", "welcome", "admin",
  "login", "abc123", "iloveyou", "dragon", "monkey", "football",
];

const SEQUENCES = [
  "abcdefghijklmnopqrstuvwxyz", "qwertyuiopasdfghjklzxcvbnm", "0123456789",
];

function hasSequence(value) {
  const lower = value.toLowerCase();
  for (const sequence of SEQUENCES) {
    for (let size = 3; size <= 5; size += 1) {
      for (let index = 0; index <= sequence.length - size; index += 1) {
        const part = sequence.slice(index, index + size);
        const reverse = [...part].reverse().join("");
        if (lower.includes(part) || lower.includes(reverse)) return true;
      }
    }
  }
  return false;
}

function formatGuessTime(seconds) {
  if (!Number.isFinite(seconds) || seconds > 3.154e18) return "centuries+";
  if (seconds < 1) return "less than a second";
  const units = [
    [31557600, "year"], [86400, "day"], [3600, "hour"],
    [60, "minute"], [1, "second"],
  ];
  for (const [unitSeconds, name] of units) {
    if (seconds >= unitSeconds) {
      const amount = Math.floor(seconds / unitSeconds);
      return `${amount.toLocaleString("en-US")} ${name}${amount === 1 ? "" : "s"}`;
    }
  }
  return "less than a second";
}

function fallbackEstimate(password) {
  const categories = [/[a-z]/.test(password), /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)];
  const poolSizes = [26, 26, 10, 28];
  const pool = categories.reduce((sum, present, index) => sum + (present ? poolSizes[index] : 0), 0);
  let entropy = password.length * Math.log2(Math.max(pool, 1));
  const lower = password.toLowerCase();
  const suggestions = [];
  let warning = "";
  if (password.length < 12) suggestions.push("Use at least 12 characters; 16 or more is safer for important accounts.");
  if (categories.filter(Boolean).length < 3) suggestions.push("Add a mix of character types or use a long random passphrase.");
  if (COMMON_PATTERNS.some((pattern) => lower.includes(pattern))) {
    entropy -= 28;
    warning = "This resembles a commonly used password.";
  }
  if (/(.)\1{2,}/.test(password)) { entropy -= 12; suggestions.push("Avoid repeated characters."); }
  if (hasSequence(password)) { entropy -= 15; suggestions.push("Avoid keyboard, alphabet, and number sequences."); }
  entropy = Math.max(0, Math.round(entropy));
  let score = 0;
  if (entropy >= 30 && password.length >= 8) score = 1;
  if (entropy >= 50 && password.length >= 10) score = 2;
  if (entropy >= 70 && password.length >= 12) score = 3;
  if (entropy >= 90 && password.length >= 16) score = 4;
  return {
    score,
    guesses_log10: entropy / Math.log2(10),
    crack_times_display: {offline_fast_hashing_1e10_per_second: formatGuessTime((2 ** Math.min(entropy, 1023)) / 10_000_000_000 / 2)},
    feedback: {warning, suggestions},
    calculation: "fallback",
  };
}

export function analyzePassword(password, estimator = globalThis.zxcvbn) {
  if (!password) {
    return { score: 0, label: "Waiting for input", entropy: 0, guessTime: "—", feedback: ["Enter a password to see practical feedback."], method: "zxcvbn" };
  }
  const result = typeof estimator === "function" ? estimator(password) : fallbackEstimate(password);
  const score = Math.max(0, Math.min(4, Number(result.score) || 0));
  const entropy = Math.max(0, Math.round((Number(result.guesses_log10) || 0) * Math.log2(10)));
  const labels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];
  const feedback = [result.feedback?.warning, ...(result.feedback?.suggestions || [])].filter(Boolean);
  if (feedback.length === 0) feedback.push("No obvious pattern was found. Keep it unique and store it in a password manager.");
  return {
    score,
    label: labels[score],
    entropy,
    guessTime: result.crack_times_display?.offline_fast_hashing_1e10_per_second || "unknown",
    feedback,
    method: result.calculation === "fallback" ? "fallback heuristic" : "zxcvbn",
  };
}

export function secureRandomInt(maxExclusive, cryptoObject = globalThis.crypto) {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0 || maxExclusive > 0x100000000) {
    throw new RangeError("maxExclusive must be an integer from 1 to 2^32");
  }
  if (!cryptoObject?.getRandomValues) throw new Error("A cryptographically secure random source is required");
  const range = 0x100000000;
  const limit = range - (range % maxExclusive);
  const buffer = new Uint32Array(1);
  do cryptoObject.getRandomValues(buffer); while (buffer[0] >= limit);
  return buffer[0] % maxExclusive;
}

export function generatePassword(length, options, cryptoObject = globalThis.crypto) {
  const selected = Object.entries(SETS).filter(([name]) => options[name] !== false);
  if (!Number.isInteger(length) || length < 12 || length > 128) throw new RangeError("Length must be between 12 and 128");
  if (selected.length === 0) throw new Error("Select at least one character set");
  if (length < selected.length) throw new Error("Length is too short for the selected sets");

  const combined = selected.map(([, chars]) => chars).join("");
  const result = selected.map(([, chars]) => chars[secureRandomInt(chars.length, cryptoObject)]);
  while (result.length < length) result.push(combined[secureRandomInt(combined.length, cryptoObject)]);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomInt(index + 1, cryptoObject);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result.join("");
}

export { SETS };
