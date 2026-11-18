import type { ControllerState } from "#src/models/genshinAssets/enemies/ControllerState";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { MONSTER_CONTROLLER_BLOCK_MAP } from "#src/services/genshinAssets/enemies/constants";
import { parseControllerStates } from "#src/services/genshinAssets/enemies/parseControllerStates";
import {
  EXTRACTED_DIRECTORY,
  GENSHIN_ANIMESTUDIO_OPTIONS,
  INSTALLED_BLOCKS_DIRECTORY,
} from "#src/services/genshinAssets/shared/constants";
import { runAnimeStudio } from "#src/services/recreation/animeStudio/runAnimeStudio";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";

// The states of a monster's Animator controller, exported as JSON from the block the controller record names, with the
// Folder cleared before the export so that only this controller is read
export const readMonsterControllerStates = async (controllerName: string): Promise<ControllerState[]> => {
  const block = MONSTER_CONTROLLER_BLOCK_MAP[controllerName];
  if (block === undefined)
    throw new InvalidOperationError(Operation.Read, controllerName, "is in no controller block record");
  const directory = join(EXTRACTED_DIRECTORY, "controllers", basename(block, ".blk"));
  rmSync(directory, { force: true, recursive: true });
  runAnimeStudio(
    [
      join(INSTALLED_BLOCKS_DIRECTORY, block),
      directory,
      "--types",
      AssetType.AnimatorController,
      "--names",
      `^${controllerName}$`,
      "--export_type",
      AnimeStudioExportType.Json,
    ],
    GENSHIN_ANIMESTUDIO_OPTIONS,
  );
  return parseControllerStates(
    await readFile(join(directory, AssetType.AnimatorController, `${controllerName}.json`), "utf8"),
  );
};
