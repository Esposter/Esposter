import type { SelectorBan } from "#scripts/models/oxlint/selectorBan/SelectorBan";

// A bar that pushes its groups apart — `justify-between`, `justify-end` or an empty `flex-1` spacer between them — and
// Also wraps puts its trailing group alone at the end of a second line once the row runs short: one button at the start
// Of the first line and one at the end of the next. A bar never wraps; its leading content yields and its actions
// Collapse into an overflow menu on a narrow screen (`responsive` skill)
const WRAPPING_BAR = "VElement:has(> VStartTag > VAttribute[key.name='flex-wrap'])";
const WRAPPING_BAR_MESSAGE =
  "Don't wrap a bar that pushes its groups apart: the trailing group strands alone on a second line. Let the leading content yield (`truncate`, `min-w-0`) and collapse the actions into an overflow menu (`responsive` skill).";

export const WRAPPING_BAR_SYNTAXES: SelectorBan[] = [
  {
    message: WRAPPING_BAR_MESSAGE,
    selector: `${WRAPPING_BAR}:has(> VStartTag > VAttribute[key.name=/^justify-(?:between|end)$/])`,
  },
  {
    message: WRAPPING_BAR_MESSAGE,
    selector: `${WRAPPING_BAR} > VElement[rawName='div'][children.length=0]:has(> VStartTag > VAttribute[key.name='flex-1'])`,
  },
];
