import { analyzePassword, generatePassword } from "./security.js";

const byId = (id) => document.getElementById(id);
const passwordInput = byId("password-input");
const meterFill = byId("meter-fill");
const colors = ["#ff7e77", "#ff9f66", "#ffd166", "#73f7ae", "#45e897"];

function renderAnalysis() {
  const result = analyzePassword(passwordInput.value);
  byId("strength-label").textContent = result.label;
  byId("score-number").textContent = passwordInput.value ? result.score : "—";
  byId("entropy-value").textContent = passwordInput.value ? `≈ ${result.entropy} bits` : "—";
  byId("time-value").textContent = result.guessTime;
  meterFill.style.width = passwordInput.value ? `${(result.score + 1) * 20}%` : "0";
  meterFill.style.backgroundColor = colors[result.score];
  const list = byId("feedback-list");
  list.replaceChildren(...result.feedback.map((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    return li;
  }));
}

function selectedOptions() {
  return {
    upper: byId("use-upper").checked,
    lower: byId("use-lower").checked,
    number: byId("use-number").checked,
    symbol: byId("use-symbol").checked,
  };
}

function refreshGeneratedPassword() {
  try {
    byId("generated-password").textContent = generatePassword(Number(byId("length").value), selectedOptions());
    byId("generate-password").disabled = false;
  } catch (error) {
    byId("generated-password").textContent = error.message;
    byId("generate-password").disabled = true;
  }
}

passwordInput.addEventListener("input", renderAnalysis);
byId("load-demo").addEventListener("click", () => {
  passwordInput.value = "Demo!River-Quartz-47";
  renderAnalysis();
});
byId("toggle-password").addEventListener("click", (event) => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  event.currentTarget.textContent = showing ? "Show" : "Hide";
  event.currentTarget.setAttribute("aria-label", showing ? "Show password" : "Hide password");
  event.currentTarget.setAttribute("aria-pressed", String(!showing));
});
byId("length").addEventListener("input", (event) => {
  byId("length-value").textContent = event.target.value;
});
byId("length").addEventListener("change", refreshGeneratedPassword);
for (const id of ["use-upper", "use-lower", "use-number", "use-symbol"]) byId(id).addEventListener("change", refreshGeneratedPassword);
byId("generate-password").addEventListener("click", refreshGeneratedPassword);
byId("copy-password").addEventListener("click", async (event) => {
  await navigator.clipboard.writeText(byId("generated-password").textContent);
  event.currentTarget.textContent = "Copied";
  window.setTimeout(() => { event.currentTarget.textContent = "Copy"; }, 1400);
});

refreshGeneratedPassword();
