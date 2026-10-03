// A placeholder holds no digit, at sign or currency sign, so no pattern matches what another wrote and the order they
// Run in changes nothing
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
    /\b(?:sk-[\w-]{16,}|gh[opsu]_\w{16,}|github_pat_\w{16,}|xox[abpr]-[\w-]{10,}|AKIA[0-9A-Z]{16}|eyJ[\w-]+\.[\w-]+\.[\w-]+)|(?=[\w+=-]*\d)(?=[\w+=-]*[A-Za-z])[\w+=-]{32,}/gu,
  ],
]);

export const veilText = (text: string): string => {
  let veiled = text;
  for (const [placeholder, pattern] of VeilPatternMap) veiled = veiled.replaceAll(pattern, placeholder);
  return veiled;
};
