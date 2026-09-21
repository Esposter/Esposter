import type { PersonaCard } from "#src/models/PersonaCard";

// The session-start hook's lines, kept apart because its two readers see different subsets: the model gets the
// Headline, the description, the note and the authored card, the person sees the headline, the note and the
// Greeting. The subsets differ and the lines do not — the greeting each is shown is the one field, so the welcome
// And the card can never greet in two languages
export interface Card {
  // The game's one-line introduction, the lore the model answers from; "" for the player character
  description: string;
  // The card's one line in the interface language where that language has written it and the card's own otherwise,
  // Shown in the welcome and in the card both; "" for a character with no card
  greeting: string;
  // The plugin naming who speaks: the name, then the title, element and region the game data holds
  headline: string;
  // The plugin's aside in brackets — the birthday and how far off it is — never a line the character says; "" when
  // The character has no birthday
  note: string;
  // Absent for a character nobody has written a card for yet, which is a character the game data alone describes
  personaCard?: PersonaCard;
}
