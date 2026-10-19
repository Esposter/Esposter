import type { InternalCooldownTag } from "genshin-world";

import { GCSIM_NO_INTERNAL_COOLDOWN_TAG } from "#src/services/genshinAssets/kits/constants";
import { GcsimInternalCooldownTagMap } from "#src/services/genshinAssets/kits/gcsim/GcsimInternalCooldownTagMap";

// The internal cooldown tag a gcsim ICD tag gives a hit, undefined for the one gcsim names for a hit with none. A tag the
// Map does not hold is kept as gcsim's literal, which the kit's schema refuses
export const toGcsimInternalCooldownTag = (identifier: string): InternalCooldownTag | undefined =>
  identifier === GCSIM_NO_INTERNAL_COOLDOWN_TAG
    ? undefined
    : (GcsimInternalCooldownTagMap[identifier] ?? (identifier as InternalCooldownTag));
