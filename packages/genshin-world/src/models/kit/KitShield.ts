import type { Shield } from "#src/models/combat/Shield";

// A shield on a character that absorbs the damage it takes for the seconds left of it, until its health is spent. It
// Is a combat shield, so its element and its health are absorbed by the combat rules
export interface KitShield extends Shield {
  characterId: number;
  kind: "shield";
  secondsRemaining: number;
}
