import type { ClipTiming } from "#src/models/genshinAssets/timings/ClipTiming";
import type { ExportedClipTiming } from "#src/models/genshinAssets/timings/ExportedClipTiming";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { EXTRACTED_DIRECTORY, GAME_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readAssetBlocks } from "#src/services/genshinAssets/shared/readAssetBlocks";
import { runAnimeStudio } from "#src/services/genshinAssets/shared/runAnimeStudio";
import { computeClipTiming } from "#src/services/genshinAssets/timings/computeClipTiming";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

// The timings of the animation clips a name pattern matches, exported as JSON from the blocks the asset index
// Finds them in, each block's folder cleared before its export so that only this pattern's clips are read
export const readClipTimings = async (clipPattern: string): Promise<ClipTiming[]> => {
  const blocks = await readAssetBlocks(clipPattern);
  if (blocks.length === 0) throw new InvalidOperationError(Operation.Read, clipPattern, "in no indexed block");
  const directory = join(EXTRACTED_DIRECTORY, "timings");
  // Made here, since AnimeStudio makes a block's folder only for a block holding a clip it exports
  await mkdir(directory, { recursive: true });
  for (const block of blocks) {
    const blockDirectory = join(directory, basename(block, ".blk"));
    rmSync(blockDirectory, { force: true, recursive: true });
    runAnimeStudio([
      join(GAME_BLOCKS_DIRECTORY, block),
      blockDirectory,
      "--types",
      AssetType.AnimationClip,
      "--names",
      clipPattern,
      "--export_type",
      AnimeStudioExportType.Json,
    ]);
  }
  const clipPaths = blocks.flatMap((block) => {
    const clipDirectory = join(directory, basename(block, ".blk"), AssetType.AnimationClip);
    return existsSync(clipDirectory) ? readdirSync(clipDirectory).map((file) => join(clipDirectory, file)) : [];
  });
  return Promise.all(
    clipPaths.map(async (clipPath) =>
      computeClipTiming(parseMachineJson<ExportedClipTiming>(await readFile(clipPath, "utf8"))),
    ),
  );
};
