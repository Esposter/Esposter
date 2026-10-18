import type { GcsimStanceNormalAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimStanceNormalAttack";

import { GCSIM_STANCE_NORMAL_ATTACKS } from "#src/services/genshinAssets/kits/constants";
import { posix } from "node:path";

// The stance a character's folder gives its normal attacks, by the folder's name
export const findGcsimStanceNormalAttack = (folder: string): GcsimStanceNormalAttack | undefined =>
  GCSIM_STANCE_NORMAL_ATTACKS[posix.basename(folder)];
