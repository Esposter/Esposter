import type { Shield } from "#src/models/combat/Shield";
import type { KitStrike } from "#src/models/kit/KitStrike";

// A shield on a character that absorbs the damage it takes for the seconds left of it, until its health is spent. It
// Is a combat shield, so its element and its health are absorbed by the combat rules
export interface KitShield extends Shield {
  characterId: number;
  // The strike the shield explodes into when its seconds run out or its health is spent, if it has one
  explosion?: KitStrike;
  kind: "shield";
  secondsRemaining: number;
}
