import type { SpinnerTip } from "#src/models/SpinnerTip";

// The `spinnerTipsOverride` user setting as the tool spells it: our tips inline, their prefix, and the built-in
// Tips hidden. Inline rather than a tips file: the tool reads both spinner keys once per process either way, and the
// File was one more state path to keep readable from every shell
export interface SpinnerTipsOverride {
  excludeDefault: boolean;
  label: string;
  tips: SpinnerTip[];
}
