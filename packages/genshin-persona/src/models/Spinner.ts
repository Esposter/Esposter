import type { SpinnerTip } from "#src/models/SpinnerTip";

// Everything the spinner shows for one character: the base Teyvat content with the character's own behind it
export interface Spinner {
  tips: SpinnerTip[];
  verbs: string[];
}
