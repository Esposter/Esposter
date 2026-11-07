import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";

import { assetRootSchema } from "#src/models/genshinAssets/shared/AssetRoot";
import { WEAPON_ROOTS_PATH } from "#src/services/genshinAssets/weapons/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { z } from "zod";

// The roots `weapon-roots` derived and committed: the game objects that hold the held weapons' meshes
export const readWeaponRoots = (): AssetRoot[] =>
  z.array(assetRootSchema).parse(parseMachineJson(readFileSync(WEAPON_ROOTS_PATH, "utf8")));
