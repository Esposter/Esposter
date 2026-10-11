import type { InternalCooldownGroup } from "#src/models/combat/InternalCooldownGroup";

import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import {
  ONE_REACTION_INTERNAL_COOLDOWN_GROUP,
  TWO_REACTIONS_INTERNAL_COOLDOWN_GROUP,
} from "#src/services/combat/internalCooldown/constants";

// The limit on each transformative reaction's damage to one target from one source. Burning's damage has none
export const TransformativeReactionInternalCooldownGroupMap: Partial<
  Record<TransformativeReactionType, InternalCooldownGroup>
> = {
  [TransformativeReactionType.Bloom]: TWO_REACTIONS_INTERNAL_COOLDOWN_GROUP,
  [TransformativeReactionType.Burgeon]: TWO_REACTIONS_INTERNAL_COOLDOWN_GROUP,
  [TransformativeReactionType.ElectroCharged]: ONE_REACTION_INTERNAL_COOLDOWN_GROUP,
  [TransformativeReactionType.Hyperbloom]: TWO_REACTIONS_INTERNAL_COOLDOWN_GROUP,
  [TransformativeReactionType.Overloaded]: ONE_REACTION_INTERNAL_COOLDOWN_GROUP,
  [TransformativeReactionType.Shattered]: TWO_REACTIONS_INTERNAL_COOLDOWN_GROUP,
  [TransformativeReactionType.Superconduct]: TWO_REACTIONS_INTERNAL_COOLDOWN_GROUP,
  [TransformativeReactionType.Swirl]: TWO_REACTIONS_INTERNAL_COOLDOWN_GROUP,
};
