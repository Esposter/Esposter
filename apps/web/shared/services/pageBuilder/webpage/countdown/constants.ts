export const COUNTDOWN_CLASS = "page-countdown";
export const COUNTDOWN_DIGIT_CLASS = "page-countdown-digit";
export const COUNTDOWN_UNIT_CLASS = "page-countdown-unit";
// The units in the order the script fills their digits
export const COUNTDOWN_UNITS = ["days", "hours", "minutes", "seconds"];
export const DEFAULT_COUNTDOWN_DAYS = 7;
export const DEFAULT_COUNTDOWN_END_TEXT = "Expired";
export const COUNTDOWN_CSS = `.${COUNTDOWN_CLASS}{display:flex;justify-content:center;gap:1.25rem;text-align:center}.${COUNTDOWN_DIGIT_CLASS}{font-size:3rem;font-variant-numeric:tabular-nums}`;
// The date is read as local midnight, the end text is written as text, and a countdown whose element has left the
// Page stops its own timer
export const COUNTDOWN_SCRIPT = `for (const element of document.querySelectorAll(".${COUNTDOWN_CLASS}")) {
  const endMs = new Date(element.dataset.date + "T00:00:00").getTime();
  const digits = element.querySelectorAll(".${COUNTDOWN_DIGIT_CLASS}");
  let timer;
  const tick = () => {
    const remainingMs = endMs - Date.now();
    if (!element.isConnected || remainingMs <= 0) {
      clearInterval(timer);
      if (element.isConnected) element.textContent = element.dataset.endText ?? "";
      return;
    }
    const seconds = Math.floor(remainingMs / 1000);
    const values = [Math.floor(seconds / 86400), Math.floor((seconds % 86400) / 3600), Math.floor((seconds % 3600) / 60), seconds % 60];
    for (const [index, digit] of digits.entries()) digit.textContent = String(values[index]).padStart(2, "0");
  };
  timer = setInterval(tick, 1000);
  tick();
}`;
