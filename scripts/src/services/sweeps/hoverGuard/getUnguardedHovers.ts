const COMMENT_REGEX = /\/\*[\s\S]*?\*\//gu;
const HOVER_MEDIA_REGEX = /@media[^{]*\(hover:\s*hover\)/u;

// A pointer's `:hover` look sits under `@media (hover: hover)`, so a touch screen leaves nothing lit after a tap, while
// `:focus-visible` and the forced Hover state draw unguarded (the interface library's design, "Hover is for a pointer
// that hovers"). Each rule's selector is read as the text before its `{`, with a stack of whether each open block is
// that query, so a `:hover` anywhere inside one is guarded and one anywhere else is reported as `line: selector`.
// Comments are blanked rather than dropped, so a line stays the line it was written on
export const getUnguardedHovers = (css: string, firstLine = 1): string[] => {
  const text = css.replaceAll(COMMENT_REGEX, (comment) => comment.replaceAll(/[^\n]/gu, " "));
  const guards: boolean[] = [];
  const findings: string[] = [];
  let headStart = 0;
  for (const { 0: brace, index } of text.matchAll(/[{}]/gu)) {
    if (brace === "{") {
      const head = text.slice(headStart, index);
      const selector = head.slice(head.lastIndexOf(";") + 1);
      if (!selector.trimStart().startsWith("@") && selector.includes(":hover") && !guards.includes(true)) {
        const selectorStart =
          headStart + head.length - selector.length + (selector.length - selector.trimStart().length);
        findings.push(`${firstLine + text.slice(0, selectorStart).split("\n").length - 1}: ${selector.trim()}`);
      }
      guards.push(HOVER_MEDIA_REGEX.test(head));
    } else guards.pop();
    headStart = index + 1;
  }
  return findings;
};
