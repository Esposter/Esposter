import type { SpinnerTip } from "#src/models/SpinnerTip";

// The `spinnerTipsOverride` user setting as the tool spells it: our tips inline and the built-in tips hidden. The
// Label is one prefix for every tip in the list — a tip object carries none, and an absent label falls back to the
// Tool's own English "Tip" — so our write always carries the character's name; only an override someone else wrote
// May lack it. Inline rather than a tips file: the tool reads both spinner keys once per process either way, and
// The file was one more state path to keep readable from every shell
export interface SpinnerTipsOverride {
  excludeDefault: boolean;
  label?: string;
  tips: SpinnerTip[];
}
