import type { CameraProfileReading } from "#src/models/genshinAssets/camera/CameraProfileReading";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { CAMERA_PROFILE_NAME } from "#src/services/genshinAssets/camera/constants";
import { parseCameraProfile } from "#src/services/genshinAssets/camera/parseCameraProfile";
import {
  EXTRACTED_DIRECTORY,
  GENSHIN_ANIMESTUDIO_OPTIONS,
  INSTALLED_BLOCKS_DIRECTORY,
} from "#src/services/genshinAssets/shared/constants";
import { readAssetBlocks } from "#src/services/genshinAssets/shared/readAssetBlocks";
import { runAnimeStudio } from "#src/services/recreation/animeStudio/runAnimeStudio";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";

// The game's camera profile exported raw from the one block the asset index finds it in, into `extracted/camera/`
// Outside the repository, and read
export const readCameraProfile = async (): Promise<CameraProfileReading> => {
  const namePattern = `^${CAMERA_PROFILE_NAME}$`;
  const blocks = await readAssetBlocks(namePattern);
  if (blocks.length !== 1)
    throw new InvalidOperationError(Operation.Read, CAMERA_PROFILE_NAME, `in ${blocks.length} indexed blocks, not one`);
  const block = takeOne(blocks);
  const directory = join(EXTRACTED_DIRECTORY, "camera");
  await rm(directory, { force: true, recursive: true });
  runAnimeStudio(
    [
      join(INSTALLED_BLOCKS_DIRECTORY, block),
      directory,
      "--types",
      AssetType.MonoBehaviour,
      "--names",
      namePattern,
      "--export_type",
      AnimeStudioExportType.Raw,
    ],
    GENSHIN_ANIMESTUDIO_OPTIONS,
  );
  const bytes = await readFile(join(directory, AssetType.MonoBehaviour, `${CAMERA_PROFILE_NAME}.dat`));
  return parseCameraProfile(bytes);
};
