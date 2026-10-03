// A placeholder holds no digit, at sign or currency sign, so no pattern matches what another wrote and the order they
// Run in changes nothing. A secret is a known key prefix; a long run mixing letters and digits, read from the run's
// Start alone so a long run of neither is scanned once rather than again from every position in it; or whatever
// Follows a password's own label, however short
const VeilPatternMap = new Map<string, RegExp>([
  [
    "[amount]",
    /[$€£¥₹]\s?\d[\d,]*(?:\.\d+)?(?:\s?[KkMmBb]\b)?|\b(?:USD|EUR|GBP|CAD|AUD|JPY|CNY)\s?\d[\d,]*(?:\.\d+)?|\b\d[\d,]*(?:\.\d+)?\s?(?:USD|EUR|GBP|CAD|AUD|JPY|CNY)\b/gu,
  ],
  ["[email]", /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/gu],
  [
    "[phone]",
    /\+\d{1,3}[\s.-]?\(?\d{1,4}\)?(?:[\s.-]?\d{2,4}){2,4}|\(\d{3}\)\s?\d{3}[\s.-]\d{4}|\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b/gu,
  ],
  [
    "[secret]",
    /\b(?:sk-[\w-]{16,}|gh[opsu]_\w{16,}|github_pat_\w{16,}|xox[abpr]-[\w-]{10,}|AKIA[0-9A-Z]{16}|eyJ[\w-]+\.[\w-]+\.[\w-]+)|(?<![\w+=-])(?=[\w+=-]*\d)(?=[\w+=-]*[A-Za-z])[\w+=-]{32,}|(?<=\b(?:[Pp]assword|PASSWORD|passwd|pwd)\s*[:=]\s*)(?:"[^"\n]*"|'[^'\n]*'|\S+)/gu,
  ],
]);

export const veilText = (text: string): string => {
  let veiled = text;
  for (const [placeholder, pattern] of VeilPatternMap) veiled = veiled.replaceAll(pattern, placeholder);
  return veiled;
};
