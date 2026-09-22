// Every match of the pattern removed, and the removal repeated until nothing matches: one pass leaves behind
// Whatever the removed text was wrapped around (`<!<!---->--` loses its inner comment and is `<!--`), which is
// The remainder a sanitizer must not leave (CodeQL `js/incomplete-multi-character-sanitization`). Terminates
// Because every pass that changes the text shortens it.
export const stripToFixedPoint = (text: string, regex: RegExp): string => {
  const stripped = text.replaceAll(regex, "");
  return stripped === text ? text : stripToFixedPoint(stripped, regex);
};
