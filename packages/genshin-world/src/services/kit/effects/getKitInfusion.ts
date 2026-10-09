import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitInfusion } from "#src/models/kit/KitInfusion";

// The infusion on a character's normal attacks, charged attack and plunges, if one is on it
export const getKitInfusion = (effects: readonly KitEffect[], characterId: number): KitInfusion | undefined =>
  effects.find((effect): effect is KitInfusion => effect.kind === "infusion" && effect.characterId === characterId);
