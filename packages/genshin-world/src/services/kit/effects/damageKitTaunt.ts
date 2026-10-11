import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitTaunt } from "#src/models/kit/KitTaunt";

import { KitEventKind } from "#src/models/kit/KitEventKind";

// Takes health from a taunt, never below none, and raises the strike as an event the next step sends to the kits. It
// Explodes on the next step its health is gone, as stepKitTaunt runs
export const damageKitTaunt = (outbox: KitEvent[], taunt: KitTaunt, damage: number): void => {
  taunt.health = Math.max(0, taunt.health - damage);
  outbox.push({ damage, kind: KitEventKind.TauntDamaged, taunt });
};
