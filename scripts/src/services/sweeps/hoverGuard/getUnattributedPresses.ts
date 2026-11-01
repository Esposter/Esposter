import { readStyleRules } from "#src/services/sweeps/hoverGuard/readStyleRules";

// A button's press is `:active`, the `data-pressed` attribute a pad's confirm sets for the moment before its click, or
// the forced Pressed state (the interface library's design, "Hover is for a pointer that hovers"), so a rule that names
// `:active` and not the attribute draws no press for a pad. A press selector reported as `line: selector`. A
// Functional pseudo-class that merely contains the text, such as a `:active-character-id` prop, is not a selector
export const getUnattributedPresses = (css: string, firstLine = 1): string[] =>
  readStyleRules(css, firstLine)
    .filter(({ selector }) => /:active(?![\w-])/u.test(selector) && !selector.includes("[data-pressed]"))
    .map(({ line, selector }) => `${line}: ${selector}`);
