// What a language's base Teyvat content holds for the spinner: the verbs every character shows, the tips a
// Character with no lines falls back to, and the word those tips stand under. A `Localization` is one of these with
// The rest of a language's words around it, so the spinner takes this and never the whole module
export interface SpinnerContent {
  // The label over the base tips, the tool's own "Tip" in this language — a base tip is nobody's line, so a
  // Character's name in front of it would read as an attribution
  tipLabel: string;
  // Lines shown while a turn runs
  tips: string[];
  // Gerunds shown while a turn runs
  verbs: string[];
}
