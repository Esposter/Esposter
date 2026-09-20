import type { Character } from "#src/models/Character";
import type { PersonaCard } from "#src/models/PersonaCard";

// A character with whatever has been written about them: the game's facts, and the card if one exists yet
export interface CardedCharacter {
  character: Character;
  personaCard?: PersonaCard;
}
