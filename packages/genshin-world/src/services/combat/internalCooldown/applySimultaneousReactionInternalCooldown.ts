import type { InternalCooldown } from "#src/models/combat/InternalCooldown";
import type { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import type { Element } from "#src/models/Element";

import { applyKeyedInternalCooldown } from "#src/services/combat/internalCooldown/applyKeyedInternalCooldown";
import {
  SIMULTANEOUS_REACTION_INTERNAL_COOLDOWN_GROUP,
  SIMULTANEOUS_REACTION_TYPES,
} from "#src/services/combat/internalCooldown/constants";
import { ID_SEPARATOR } from "@esposter/shared";

// Whether a reaction triggered on a target lands, counted in place into the internal cooldown the target keeps for it
// Whatever its source, as 1 or 0. A Swirl of one element, a Superconduct or an Overloaded within a tenth of a second of
// The last of its kind to land on the target deals no damage and reaches nothing, and every other reaction lands
export const applySimultaneousReactionInternalCooldown = (
  internalCooldownMap: Map<string, InternalCooldown>,
  transformativeReactionType: TransformativeReactionType,
  element: Element | undefined,
  seconds: number,
): number =>
  SIMULTANEOUS_REACTION_TYPES.includes(transformativeReactionType)
    ? applyKeyedInternalCooldown(
        internalCooldownMap,
        `${transformativeReactionType}${ID_SEPARATOR}${element ?? ""}`,
        SIMULTANEOUS_REACTION_INTERNAL_COOLDOWN_GROUP,
        seconds,
      )
    : 1;
