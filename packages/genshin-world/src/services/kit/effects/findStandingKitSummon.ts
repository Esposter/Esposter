import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitSummon } from "#src/models/kit/KitSummon";

// The summon of an id its character cast that stands on the field, one that has spawned by its seconds
export const findStandingKitSummon = (
  effects: readonly KitEffect[],
  id: string,
  characterId: number,
): KitSummon | undefined =>
  effects.find(
    (effect): effect is KitSummon =>
      effect.kind === "summon" &&
      effect.id === id &&
      effect.combatant.characterId === characterId &&
      effect.elapsedSeconds >= (effect.spawnSeconds ?? 0),
  );
