import type { Shield } from "#src/models/combat/Shield";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

// A shield a character casts onto the team, which absorbs the damage the character on the field takes, whoever cast it,
// For the seconds left of it, until its health is spent. It is a combat shield, so its element and its health are absorbed
// By the combat rules
export interface KitShield extends Shield {
  // The character that cast it, which a recast over it and Breastplate's heal are keyed on
  characterId: number;
  // The explosion it goes off into as it ends, if it has one: its hit, and its caster as the caster stood when it was cast
  explosion?: { combatant: Combatant; hit: KitHit };
  kind: "shield";
  secondsRemaining: number;
}
