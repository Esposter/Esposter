import type { CooldownGroupReadyAtMap } from "#src/models/gadget/CooldownGroupReadyAtMap";
import type { GadgetRow } from "#src/models/gadget/GadgetRow";

import { getCooldownGroup } from "#src/services/gadget/getCooldownGroup";

// The seconds a gadget's cooldown has left at `now`, none once its group is ready or when it was never used. The HUD
// Shows it on the gadget's button, which counts it down as the world's clock runs
export const getGadgetCooldownSeconds = (
  cooldownGroupReadyAtMap: CooldownGroupReadyAtMap,
  gadget: GadgetRow,
  now: Temporal.Instant,
): number => {
  const readyAt = cooldownGroupReadyAtMap.get(getCooldownGroup(gadget));
  return readyAt === undefined ? 0 : Math.max(0, (readyAt.epochMilliseconds - now.epochMilliseconds) / 1000);
};
