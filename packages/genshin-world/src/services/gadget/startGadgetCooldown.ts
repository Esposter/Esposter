import type { CooldownGroupReadyAtMap } from "#src/models/gadget/CooldownGroupReadyAtMap";
import type { GadgetRow } from "#src/models/gadget/GadgetRow";

import { getCooldownGroup } from "#src/services/gadget/getCooldownGroup";

// The cooldown map with the gadget's group started at `now`: a use that works starts the gadget's cooldown, and a failed
// Use starts its cooldown on a failed use. The map given is left as it was
export const startGadgetCooldown = (
  cooldownGroupReadyAtMap: CooldownGroupReadyAtMap,
  gadget: GadgetRow,
  isFailed: boolean,
  now: Temporal.Instant,
): CooldownGroupReadyAtMap => {
  const cooldownSeconds = isFailed ? gadget.cooldownOnFailSeconds : gadget.cooldownSeconds;
  const readyAt = now.add({ seconds: cooldownSeconds });
  return new Map(cooldownGroupReadyAtMap).set(getCooldownGroup(gadget), readyAt);
};
