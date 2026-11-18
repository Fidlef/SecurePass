import test from "node:test";
import assert from "node:assert/strict";
import { analyzePassword, generatePassword, secureRandomInt, SETS } from "../static/js/security.js";

test("blank input returns waiting state", () => {
  const result = analyzePassword("");
  assert.equal(result.label, "Waiting for input");
  assert.equal(result.entropy, 0);
});

test("common and sequential passwords are penalized", () => {
  const weak = analyzePassword("Password1234!");
  const strong = analyzePassword("M7!qZ2@vL9#xR4$pT8");
  assert.ok(strong.score > weak.score);
  assert.ok(weak.feedback.some((item) => item.includes("common")));
});

test("generator includes every selected character set", () => {
  const password = generatePassword(32, { upper: true, lower: true, number: true, symbol: true });
  assert.equal(password.length, 32);
  assert.ok([...SETS.upper].some((character) => password.includes(character)));
  assert.ok([...SETS.lower].some((character) => password.includes(character)));
  assert.ok([...SETS.number].some((character) => password.includes(character)));
  assert.ok([...SETS.symbol].some((character) => password.includes(character)));
});

test("generator rejects unsafe configuration", () => {
  assert.throws(() => generatePassword(8, { upper: true }), /between 12 and 128/);
  assert.throws(() => generatePassword(20, { upper: false, lower: false, number: false, symbol: false }), /at least one/);
});

test("secureRandomInt uses rejection sampling and stays in range", () => {
  const values = [0xffffffff, 8];
  const fakeCrypto = { getRandomValues(array) { array[0] = values.shift(); return array; } };
  assert.equal(secureRandomInt(10, fakeCrypto), 8);
});
