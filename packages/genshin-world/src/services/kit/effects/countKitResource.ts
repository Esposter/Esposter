import type { KitEffect } from "#src/models/kit/KitEffect";

import { findKitStatus } from "#src/services/kit/effects/findKitStatus";

// The amount of a resource a character holds, none while it holds none. A resource is a count with a cap that outlives any
// Timer, such as Raiden's Resolve, held as a status whose stacks are the amount, which never runs out unless a stance holds it
export const countKitResource = (effects: readonly KitEffect[], characterId: number, id: string): number =>
  findKitStatus(effects, characterId, id)?.stacks ?? 0;
