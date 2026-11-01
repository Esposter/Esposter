import type { StyleRule } from "#src/models/sweeps/hoverGuard/StyleRule";

const COMMENT_REGEX = /\/\*[\s\S]*?\*\//gu;
const HOVER_MEDIA_REGEX = /@media[^{]*\(hover:\s*hover\)/u;

// Each rule of a stylesheet, its selector read as the text before its `{`, with a stack of whether each open block is
// the hover media query, so a rule anywhere inside one is guarded. At-rules are not rules and are left out. Comments
// Are blanked rather than dropped, so a line stays the line it was written on
export const readStyleRules = (css: string, firstLine = 1): StyleRule[] => {
  const text = css.replaceAll(COMMENT_REGEX, (comment) => comment.replaceAll(/[^\n]/gu, " "));
  const guards: boolean[] = [];
  const rules: StyleRule[] = [];
  let headStart = 0;
  for (const { 0: brace, index } of text.matchAll(/[{}]/gu)) {
    if (brace === "{") {
      const head = text.slice(headStart, index);
      const selector = head.slice(head.lastIndexOf(";") + 1);
      if (!selector.trimStart().startsWith("@")) {
        const selectorStart =
          headStart + head.length - selector.length + (selector.length - selector.trimStart().length);
        rules.push({
          isHoverGuarded: guards.includes(true),
          line: firstLine + text.slice(0, selectorStart).split("\n").length - 1,
          selector: selector.trim(),
        });
      }
      guards.push(HOVER_MEDIA_REGEX.test(head));
    } else guards.pop();
    headStart = index + 1;
  }
  return rules;
};
