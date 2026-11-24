import type { SelectorBan } from "#scripts/models/oxlint/selectorBan/SelectorBan";

import { BLOCKED_SPELLINGS } from "#web/configuration/blockedSpellings";

// The template half of the app's UnoCSS blocklist: a blocked spelling generates nothing.
// The element it is written on silently loses that style.
// A utility is written as a token of a static `class` or as an attribute with no value.
// A utility may carry variants before it (`hover:p4`), so each spelling is matched after any run of them.
// A spelling anchored at the utility's start is matched from the token's start.
// One that is not may sit anywhere in the token.
const VARIANTS = String.raw`(?:[^\s:]+:)*`;

const toUtilityPattern = (matcher: RegExp, end: string) => {
  const isAnchored = matcher.source.startsWith("^");
  const body = matcher.source.replaceAll(/(?<=^|\|)\^/gu, "").replace(/\$$/u, end);
  return isAnchored ? `${VARIANTS}(?:${body})` : String.raw`\S*(?:${body})`;
};

export const BLOCKED_SPELLING_SYNTAXES: SelectorBan[] = BLOCKED_SPELLINGS.map(([matcher, canonical]) => ({
  message: `Don't write a spelling the UnoCSS blocklist refuses: it generates nothing. Write ${canonical}.`,
  selector: String.raw`VAttribute[directive=false]:matches(:not([value])[key.name=/^${toUtilityPattern(matcher, "$")}/], [key.name='class'][value.value=/(?:^|\s)${toUtilityPattern(matcher, String.raw`(?:\s|$)`)}/])`,
}));
