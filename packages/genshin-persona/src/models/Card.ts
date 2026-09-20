import type { VoiceCard } from "#src/models/VoiceCard";

// The session-start hook's lines, kept apart because its two readers see different subsets: the model gets the
// Headline, the description, the note and the voice card's context, the person sees the headline, the note and the
// Greeting
export interface Card {
  // The game's one-line introduction, the lore the model answers from; "" for the player character
  description: string;
  // The plugin naming who speaks: the name, then the title, element and region the game data holds
  headline: string;
  // The plugin's aside in brackets — the birthday and how far off it is — never a line the character says; "" when
  // The character has no birthday
  note: string;
  voiceCard: VoiceCard;
}
