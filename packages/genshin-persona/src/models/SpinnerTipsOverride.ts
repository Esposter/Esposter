import type { SpinnerTip } from "#src/models/SpinnerTip";

// The `spinnerTipsOverride` user setting as the tool spells it: our tips inline and the built-in tips hidden. The
// Label is one prefix for every tip in the list — a tip object carries none, and an absent label falls back to the
// Tool's own English "Tip" — so our write always carries one: the character's name over their own tips and the
// Interface language's word for "Tip" over the base tips; only an override someone else wrote may lack it. Inline
// Rather than a tips file: the tool reads both spinner keys once per process either way, and the file was one more
// State path to keep readable from every shell
export interface SpinnerTipsOverride {
  excludeDefault: boolean;
  label?: string;
  tips: SpinnerTip[];
}
