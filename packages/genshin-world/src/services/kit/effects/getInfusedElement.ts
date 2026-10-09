import type { Element } from "#src/models/Element";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitInfusion } from "#src/models/kit/KitInfusion";

// The element a character's normal attacks, charged attack and plunges are infused with, if an infusion is on it
export const getInfusedElement = (effects: readonly KitEffect[], characterId: number): Element | undefined =>
  effects.find((effect): effect is KitInfusion => effect.kind === "infusion" && effect.characterId === characterId)
    ?.element;
