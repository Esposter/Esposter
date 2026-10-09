import type { Element } from "#src/models/Element";
import type { GcgAura } from "#src/models/gcg/GcgAura";
import type { GcgCharacter } from "#src/models/gcg/GcgCharacter";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

// A character in one duel: the card it is, and what the duel holds for it: its HP, its energy toward its burst, its aura,
// Its shield points, whether a Frozen status keeps it from its skills until the round ends, the cards equipped to it, and
// The statuses it carries
export interface GcgCharacterState {
  aura: Element | GcgAura;
  character: GcgCharacter;
  energy: number;
  equipments: GcgZoneCard[];
  hp: number;
  isFrozen: boolean;
  shield: number;
  statuses: GcgZoneCard[];
}
