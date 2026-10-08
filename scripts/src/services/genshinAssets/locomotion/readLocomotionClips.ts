import type { ExportedLocomotionClip } from "#src/models/genshinAssets/locomotion/ExportedLocomotionClip";
import type { LocomotionClipReading } from "#src/models/genshinAssets/locomotion/LocomotionClipReading";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { computeLocomotionClipReading } from "#src/services/genshinAssets/locomotion/computeLocomotionClipReading";
import { LOCOMOTION_CLIP_ACTIONS } from "#src/services/genshinAssets/locomotion/constants";
import { EXTRACTED_DIRECTORY, GAME_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readAssetBlocks } from "#src/services/genshinAssets/shared/readAssetBlocks";
import { runAnimeStudio } from "#src/services/genshinAssets/shared/runAnimeStudio";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

// A body type's locomotion clips, by the body's name in the game's clip names (`Ani_Avatar_Girl_RunCycle`), exported as
// JSON from the blocks the asset index finds them in and each read for its root's motion. The readings are written as
// `locomotion.json` beside the exports, outside the repository
export const readLocomotionClips = async (body: string): Promise<LocomotionClipReading[]> => {
  const clipPattern = `^Ani_Avatar_${body}_(${LOCOMOTION_CLIP_ACTIONS.join("|")})$`;
  const blocks = await readAssetBlocks(clipPattern);
  if (blocks.length === 0) throw new InvalidOperationError(Operation.Read, clipPattern, "in no indexed block");
  const directory = join(EXTRACTED_DIRECTORY, "locomotion", body);
  await rm(directory, { force: true, recursive: true });
  // Made here, since AnimeStudio makes it only for a block holding a clip it exports
  await mkdir(directory, { recursive: true });
  for (const block of blocks)
    runAnimeStudio([
      join(GAME_BLOCKS_DIRECTORY, block),
      join(directory, basename(block, ".blk")),
      "--types",
      AssetType.AnimationClip,
      "--names",
      clipPattern,
      "--export_type",
      AnimeStudioExportType.Json,
    ]);
  const readings: LocomotionClipReading[] = [];
  for (const block of await readdir(directory)) {
    const clipDirectory = join(directory, block, "AnimationClip");
    if (!existsSync(clipDirectory)) continue;
    // oxlint-disable-next-line no-await-in-loop -- one block's clips are read at a time
    for (const file of await readdir(clipDirectory)) {
      // oxlint-disable-next-line no-await-in-loop -- as above
      const clip = parseMachineJson<ExportedLocomotionClip>(await readFile(join(clipDirectory, file), "utf8"));
      readings.push(computeLocomotionClipReading(clip));
    }
  }
  await writeFile(join(directory, "locomotion.json"), JSON.stringify(readings));
  return readings;
};
