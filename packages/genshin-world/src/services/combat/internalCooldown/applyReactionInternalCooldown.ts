import type { InternalCooldown } from "#src/models/combat/InternalCooldown";
import type { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import type { Element } from "#src/models/Element";

import { applyKeyedInternalCooldown } from "#src/services/combat/internalCooldown/applyKeyedInternalCooldown";
import {
  SIMULTANEOUS_REACTION_INTERNAL_COOLDOWN_GROUP,
  SIMULTANEOUS_REACTION_TYPES,
} from "#src/services/combat/internalCooldown/constants";
import { TransformativeReactionInternalCooldownGroupMap } from "#src/services/combat/internalCooldown/TransformativeReactionInternalCooldownGroupMap";
import { ID_SEPARATOR } from "@esposter/shared";

// A transformative reaction's damage on a target, counted in place into the internal cooldowns the target keeps, and the
// Share of it dealt. Each reaction counts by its element too, so Swirls of each element count apart. A Swirl,
// Superconduct or Overloaded within a tenth of a second of the last of its kind to deal damage deals none, whatever its
// Source, and what passes deals the share its source's own internal cooldown holds for it
export const applyReactionInternalCooldown = (
  internalCooldownMap: Map<string, InternalCooldown>,
  sourceId: number,
  transformativeReactionType: TransformativeReactionType,
  element: Element | undefined,
  seconds: number,
): number => {
  const reactionKey = `${transformativeReactionType}${ID_SEPARATOR}${element ?? ""}`;
  if (
    SIMULTANEOUS_REACTION_TYPES.includes(transformativeReactionType) &&
    applyKeyedInternalCooldown(
      internalCooldownMap,
      reactionKey,
      SIMULTANEOUS_REACTION_INTERNAL_COOLDOWN_GROUP,
      seconds,
    ) === 0
  )
    return 0;
  const internalCooldownGroup = TransformativeReactionInternalCooldownGroupMap[transformativeReactionType];
  return internalCooldownGroup
    ? applyKeyedInternalCooldown(
        internalCooldownMap,
        `${sourceId}${ID_SEPARATOR}${reactionKey}`,
        internalCooldownGroup,
        seconds,
      )
    : 1;
};
