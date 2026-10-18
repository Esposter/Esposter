import type { InternalCooldownGroup } from "#src/models/combat/InternalCooldownGroup";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import {
  CITLALI_FROSTFALL_STORM_INTERNAL_COOLDOWN_GROUP,
  FURINA_SALON_INTERNAL_COOLDOWN_GROUP,
} from "#src/services/combat/internalCooldown/constants";

// The group a tag's hits count under where gcsim gives it one of its own, every other tag counting under the standard
// Group
export const InternalCooldownTagGroupMap: Partial<Record<InternalCooldownTag, InternalCooldownGroup>> = {
  [InternalCooldownTag.CitlaliFrostfallStorm]: CITLALI_FROSTFALL_STORM_INTERNAL_COOLDOWN_GROUP,
  [InternalCooldownTag.FurinaChevalmarin]: FURINA_SALON_INTERNAL_COOLDOWN_GROUP,
  [InternalCooldownTag.FurinaUsher]: FURINA_SALON_INTERNAL_COOLDOWN_GROUP,
};
