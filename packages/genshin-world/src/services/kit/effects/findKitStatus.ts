import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStatus } from "#src/models/kit/KitStatus";

// The status of an id a character carries among the team's effects, if it carries one
export const findKitStatus = (effects: readonly KitEffect[], characterId: number, id: string): KitStatus | undefined =>
  effects.find(
    (effect): effect is KitStatus => effect.kind === "status" && effect.characterId === characterId && effect.id === id,
  );
