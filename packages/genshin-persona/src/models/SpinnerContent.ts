// The two lists a language's base Teyvat content holds: the verbs every character shows, the tips a character with
// No lines falls back to. A `Localization` is one of these with the rest of a language's words around it, so the
// Spinner takes this and never the whole module
export interface SpinnerContent {
  // Lines shown while a turn runs
  tips: string[];
  // Gerunds shown while a turn runs
  verbs: string[];
}
