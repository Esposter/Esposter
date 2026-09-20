import type { SpinnerTip } from "#src/models/SpinnerTip";

// The `spinnerTipsOverride` user setting as the tool spells it: our tips inline and the built-in tips hidden. The
// Label is one prefix for every tip in the list — a tip object carries none, and an empty label falls back to the
// Tool's own "Tip" — so it is the character's name over their own tips and absent over the base tips. Inline
// Rather than a tips file: the tool reads both spinner keys once per process either way, and the file was one more
// State path to keep readable from every shell
export interface SpinnerTipsOverride {
  excludeDefault: boolean;
  label?: string;
  tips: SpinnerTip[];
}
