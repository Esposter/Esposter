import type { KitEffect } from "#src/models/kit/KitEffect";

// Whether a character has a field of an id standing, for a kit that casts one under its name once and reads it from
// Then on
export const checkHasKitField = (effects: readonly KitEffect[], characterId: number, id: string): boolean =>
  effects.some((effect) => effect.kind === "field" && effect.characterId === characterId && effect.id === id);
