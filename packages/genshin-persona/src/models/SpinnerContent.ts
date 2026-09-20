// The two lists the base Teyvat content holds: the verbs every character shows, the tips a character with no
// Lines falls back to
export interface SpinnerContent {
  // Lines shown while a turn runs
  tips: string[];
  // Gerunds shown while a turn runs
  verbs: string[];
}
