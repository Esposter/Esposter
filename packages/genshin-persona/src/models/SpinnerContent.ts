// The two lists the spinner draws from, in the base Teyvat content and again on every character's own card
export interface SpinnerContent {
  // Lines shown while a turn runs, under the current character's name as the label
  tips: string[];
  // Gerunds shown while a turn runs
  verbs: string[];
}
