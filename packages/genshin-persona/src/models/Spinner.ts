import type { SpinnerTip } from "#src/models/SpinnerTip";

// Everything the spinner shows for one character. The verbs carry both layers, the base Teyvat content with the
// Character's own behind it; the tips carry one, the character's lines, because the tool shows one label in front
// Of every tip
export interface Spinner {
  // The character's name in front of their own tips, the language's word for "Tip" in front of the base tips
  label: string;
  tips: SpinnerTip[];
  verbs: string[];
}
