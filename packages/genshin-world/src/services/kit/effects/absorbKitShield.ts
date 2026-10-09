import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitShield } from "#src/models/kit/KitShield";

// Takes a character's shield to the damage it is dealt, written in place: the shield absorbs what its health holds, and
// One spent is dropped by the next step. It returns the damage the shield did not absorb, which is all of it with none up
export const absorbKitShield = (effects: KitEffect[], characterId: number, damage: number): number => {
  const shield = effects.find(
    (effect): effect is KitShield => effect.kind === "shield" && effect.characterId === characterId,
  );
  if (!shield) return damage;
  const absorbed = Math.min(shield.health, damage);
  shield.health -= absorbed;
  if (shield.health <= 0) shield.secondsRemaining = 0;
  return damage - absorbed;
};
