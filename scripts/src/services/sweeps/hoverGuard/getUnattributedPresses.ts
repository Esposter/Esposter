import { readStyleRules } from "#src/services/sweeps/hoverGuard/readStyleRules";

// Each selector of a selector list, split on the commas outside any parentheses or brackets. The commas inside a
// `:is(:active, [data-pressed])` do not split it, since it is one selector
const splitSelectorList = (selector: string): string[] => {
  const selectors: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < selector.length; index++) {
    const char = selector.charAt(index);
    if (char === "(" || char === "[") depth++;
    else if (char === ")" || char === "]") depth--;
    else if (char === "," && depth === 0) {
      selectors.push(selector.slice(start, index));
      start = index + 1;
    }
  }
  selectors.push(selector.slice(start));
  return selectors;
};

// A button's press is `:active`, the `data-pressed` attribute a pad's confirm sets for the moment before its click, or
// The forced Pressed state (the interface library's design, "Hover is for a pointer that hovers"), so a rule that names
// `:active` and not the attribute draws no press for a pad. A rule is reported when any one of its selectors does that,
// `.x:active, .y[data-pressed]` included. Each press selector is reported as `line: selector`.
// A pseudo-class that only contains the state, such as `:active-character-id`, is not a selector
export const getUnattributedPresses = (css: string, firstLine = 1): string[] =>
  readStyleRules(css, firstLine)
    .filter(({ selector }) =>
      splitSelectorList(selector).some((part) => /:active(?![\w-])/u.test(part) && !part.includes("[data-pressed]")),
    )
    .map(({ line, selector }) => `${line}: ${selector}`);
