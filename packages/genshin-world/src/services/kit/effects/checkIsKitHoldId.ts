import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStatus } from "#src/models/kit/KitStatus";

import { ID_SEPARATOR } from "@esposter/shared";

// Whether an effect is a hold of a passive's id on a character, whatever seconds it has left
export const checkIsKitHoldId = (effect: KitEffect, characterId: number, id: string): effect is KitStatus =>
  effect.kind === "status" && effect.characterId === characterId && effect.id.startsWith(`${id}${ID_SEPARATOR}`);
