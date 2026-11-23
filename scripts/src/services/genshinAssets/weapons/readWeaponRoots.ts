import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";

import { assetRootSchema } from "#src/models/genshinAssets/shared/AssetRoot";
import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { WEAPON_ROOTS_KEY } from "#src/services/genshinAssets/weapons/constants";
import { z } from "zod";

// The roots `weapon-roots` published: the game objects that hold the held weapons' meshes, read through the lock
export const readWeaponRoots = async (): Promise<AssetRoot[]> =>
  z.array(assetRootSchema).parse(await readPublishedGameData<unknown>(WEAPON_ROOTS_KEY));
