import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStance } from "#src/models/kit/KitStance";

// The stance a character's kit holds, if it holds one
export const findKitStance = (effects: readonly KitEffect[], characterId: number): KitStance | undefined =>
  effects.find((effect): effect is KitStance => effect.kind === "stance" && effect.characterId === characterId);
