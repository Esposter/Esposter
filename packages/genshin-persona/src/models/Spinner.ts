import type { SpinnerTip } from "#src/models/SpinnerTip";

// Everything the spinner shows for one character: the base Teyvat content with the character's own behind it,
// Under the character's name
export interface Spinner {
  label: string;
  tips: SpinnerTip[];
  verbs: string[];
}
