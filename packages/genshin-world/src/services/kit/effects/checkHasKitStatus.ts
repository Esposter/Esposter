import type { KitEffect } from "#src/models/kit/KitEffect";

// Whether a character carries a status of an id among the team's effects
export const checkHasKitStatus = (effects: readonly KitEffect[], characterId: number, id: string): boolean =>
  effects.some((effect) => effect.kind === "status" && effect.characterId === characterId && effect.id === id);
