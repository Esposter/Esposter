import type { CooldownGroupReadyAtMap } from "#src/models/gadget/CooldownGroupReadyAtMap";
import type { GadgetRow } from "#src/models/gadget/GadgetRow";

import { checkIsGadgetReady } from "#src/services/gadget/checkIsGadgetReady";
import { startGadgetCooldown } from "#src/services/gadget/startGadgetCooldown";

// The cooldowns after Z uses the equipped gadget at `now`: a gadget whose group is ready is used and its group's cooldown
// Starts, and the cooldowns are returned as they become. One still cooling down is not used, so none is returned
export const quickUseGadget = (
  cooldownGroupReadyAtMap: CooldownGroupReadyAtMap,
  gadget: GadgetRow,
  now: Temporal.Instant,
): CooldownGroupReadyAtMap | undefined =>
  checkIsGadgetReady(cooldownGroupReadyAtMap, gadget, now)
    ? startGadgetCooldown(cooldownGroupReadyAtMap, gadget, false, now)
    : undefined;
