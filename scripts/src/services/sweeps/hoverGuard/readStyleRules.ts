import type { StyleRule } from "#src/models/sweeps/hoverGuard/StyleRule";

import { blankCssComments } from "#src/services/sweeps/blankCssComments";

// The hover query, unless the prelude negates it: `not (hover: hover)` is the touch-only case, which the guard must not claim
const HOVER_MEDIA_REGEX = /@media(?![^{]*\bnot\b)[^{]*\(hover:\s*hover\)/u;

// Each rule of a stylesheet, its selector read as the text before its `{`, with a stack of whether each open block is
// The hover media query, so a rule anywhere inside one is guarded. At-rules are not rules and are left out. Comments
// Are blanked rather than dropped, so a line stays the line it was written on
export const readStyleRules = (css: string, firstLine = 1): StyleRule[] => {
  const text = blankCssComments(css);
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
