// The session-start hook's three kinds of line, kept apart because its two readers see different subsets: the model
// Gets all three as context, the person sees the headline, the note and the greeting alone
export interface Card {
  // The plugin naming who speaks: the name, then the title, element and region the game data holds
  headline: string;
  // The plugin's aside in brackets — the birthday and how far off it is — never a line the character says; "" when
  // The character has no birthday
  note: string;
  // The authored voice card as its file holds it; "" when the character has none
  voiceCard: string;
}
