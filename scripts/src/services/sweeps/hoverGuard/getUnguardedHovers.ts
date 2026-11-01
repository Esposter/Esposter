import { readStyleRules } from "#src/services/sweeps/hoverGuard/readStyleRules";

// A pointer's `:hover` look sits under `@media (hover: hover)`, so a touch screen leaves nothing lit after a tap, while
// `:focus-visible` and the forced Hover state draw unguarded (the interface library's design, "Hover is for a pointer
// that hovers"). A `:hover` anywhere outside one is reported as `line: selector`
export const getUnguardedHovers = (css: string, firstLine = 1): string[] =>
  readStyleRules(css, firstLine)
    .filter(({ isHoverGuarded, selector }) => selector.includes(":hover") && !isHoverGuarded)
    .map(({ line, selector }) => `${line}: ${selector}`);
