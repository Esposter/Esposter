import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitTaunt } from "#src/models/kit/KitTaunt";
import type { Except } from "type-fest";

import { addKitEffect } from "#src/services/kit/effects/addKitEffect";

// A taunt cast onto the team's effects where its body stands, priced by the combatant that cast it as it stood then. It
// Copies the body, so the taunt stays where it was cast
export const castKitTaunt = (
  kitEffectState: KitEffectState,
  { facing, height, position }: KitBody,
  combatant: Combatant,
  { explosion, health, secondsRemaining }: Except<KitTaunt, "body" | "combatant" | "kind">,
): void => {
  addKitEffect(kitEffectState, {
    body: { facing, height, position: { x: position.x, z: position.z } },
    combatant,
    ...(explosion && { explosion }),
    health,
    kind: "taunt",
    secondsRemaining,
  });
};
