import type { AttackTag } from "genshin-world";

import { GcsimAttackTagMap } from "#src/services/genshinAssets/kits/gcsim/GcsimAttackTagMap";

// The kit attack tag a gcsim attack tag names, undefined for one the kit's attack tags do not hold
export const toGcsimAttackTag = (identifier: string): AttackTag | undefined => GcsimAttackTagMap[identifier];
