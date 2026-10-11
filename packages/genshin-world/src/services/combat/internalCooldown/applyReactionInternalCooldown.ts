import type { InternalCooldown } from "#src/models/combat/InternalCooldown";
import type { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import type { Element } from "#src/models/Element";

import { applyKeyedInternalCooldown } from "#src/services/combat/internalCooldown/applyKeyedInternalCooldown";
import { TransformativeReactionInternalCooldownGroupMap } from "#src/services/combat/internalCooldown/TransformativeReactionInternalCooldownGroupMap";
import { ID_SEPARATOR } from "@esposter/shared";

// A transformative reaction's damage on a target from one source, counted in place into the internal cooldown the target
// Keeps for the source, reaction and element, so Swirls of each element count apart, and the share of it dealt
export const applyReactionInternalCooldown = (
  internalCooldownMap: Map<string, InternalCooldown>,
  sourceId: number,
  transformativeReactionType: TransformativeReactionType,
  element: Element | undefined,
  seconds: number,
): number => {
  const internalCooldownGroup = TransformativeReactionInternalCooldownGroupMap[transformativeReactionType];
  return internalCooldownGroup
    ? applyKeyedInternalCooldown(
        internalCooldownMap,
        [sourceId, transformativeReactionType, element ?? ""].join(ID_SEPARATOR),
        internalCooldownGroup,
        seconds,
      )
    : 1;
};
