import type { PersonaCard } from "#src/models/PersonaCard";

// The session-start hook's lines, kept apart because its two readers see different subsets: the model gets the
// Headline, the description, the note and the authored card whole, the person sees the headline, the note and
// The greeting
export interface Card {
  // The game's one-line introduction, the lore the model answers from; "" for the player character
  description: string;
  // The one line of the card a person reads, so it is the interface language's where that language has written
  // It and the card's own otherwise; "" for a character with no card
  greeting: string;
  // The plugin naming who speaks: the name, then the title, element and region the game data holds
  headline: string;
  // The plugin's aside in brackets — the birthday and how far off it is — never a line the character says; "" when
  // The character has no birthday
  note: string;
  // Absent for a character nobody has written a card for yet, which is a character the game data alone describes
  personaCard?: PersonaCard;
}
