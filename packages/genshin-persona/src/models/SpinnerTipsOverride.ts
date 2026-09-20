import type { SpinnerTip } from "#src/models/SpinnerTip";

// The `spinnerTipsOverride` user setting as the tool spells it: our tips inline and the built-in tips hidden, under
// The tool's own "Tip" prefix — a base tip is nobody's line, so no character's name goes in front of it. Inline
// Rather than a tips file: the tool reads both spinner keys once per process either way, and the file was one more
// State path to keep readable from every shell
export interface SpinnerTipsOverride {
  excludeDefault: boolean;
  tips: SpinnerTip[];
}
