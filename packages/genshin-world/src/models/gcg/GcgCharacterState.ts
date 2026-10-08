import type { Element } from "#src/models/Element";
import type { GcgAura } from "#src/models/gcg/GcgAura";
import type { GcgCharacter } from "#src/models/gcg/GcgCharacter";

// A character in one duel: the card it is, and what the duel holds for it: its HP, its energy toward its burst, its aura,
// Its shield points and whether a Frozen status keeps it from its skills until the round ends
export interface GcgCharacterState {
  aura: Element | GcgAura;
  character: GcgCharacter;
  energy: number;
  hp: number;
  isFrozen: boolean;
  shield: number;
}
