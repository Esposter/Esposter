import type { KitShield } from "#src/models/kit/KitShield";
import type { KitStrike } from "#src/models/kit/KitStrike";

// A shield's explosion, run on by a step once its seconds have run out or its health is spent, which lands once: the step
// Drops the shield after it
export const stepKitShield = (shield: KitShield): KitStrike[] =>
  shield.secondsRemaining > 0 || !shield.explosion ? [] : [shield.explosion];
