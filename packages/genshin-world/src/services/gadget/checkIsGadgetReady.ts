import type { CooldownGroupReadyAtMap } from "#src/models/gadget/CooldownGroupReadyAtMap";
import type { GadgetRow } from "#src/models/gadget/GadgetRow";

import { getCooldownGroup } from "#src/services/gadget/getCooldownGroup";

// Whether a gadget can be used at `now`: its group was never used, or `now` has reached the moment the group is ready.
// Nothing is ticked, so a cooldown counts on through a paused world as it does through a running one
export const checkIsGadgetReady = (
  cooldownGroupReadyAtMap: CooldownGroupReadyAtMap,
  gadget: GadgetRow,
  now: Temporal.Instant,
): boolean => {
  const readyAt = cooldownGroupReadyAtMap.get(getCooldownGroup(gadget));
  return readyAt === undefined || Temporal.Instant.compare(now, readyAt) >= 0;
};
