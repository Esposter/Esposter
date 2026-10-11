import type { ExportedLocomotionClip } from "#src/models/genshinAssets/locomotion/ExportedLocomotionClip";
import type { LocomotionClipReading } from "#src/models/genshinAssets/locomotion/LocomotionClipReading";

import { computeLocomotionClipReading } from "#src/services/genshinAssets/locomotion/computeLocomotionClipReading";
import { LOCOMOTION_CLIP_ACTIONS } from "#src/services/genshinAssets/locomotion/constants";
import { EXTRACTED_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { exportClipBlocks } from "#src/services/genshinAssets/shared/exportClipBlocks";
import { readAssetBlocks } from "#src/services/genshinAssets/shared/readAssetBlocks";
import { readExportedClips } from "#src/services/genshinAssets/shared/readExportedClips";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

// A body type's locomotion clips, by the body's name in the game's clip names (`Ani_Avatar_Girl_RunCycle`), exported as
// JSON from the blocks the asset index finds them in and each read for its root's motion at the body's human scale. The
// Readings are written as `locomotion.json` beside the exports, outside the repository
export const readLocomotionClips = async (body: string, humanScale: number): Promise<LocomotionClipReading[]> => {
  const clipPattern = `^Ani_Avatar_${body}_(${LOCOMOTION_CLIP_ACTIONS.join("|")})$`;
  const blocks = await readAssetBlocks(clipPattern);
  if (blocks.length === 0) throw new InvalidOperationError(Operation.Read, clipPattern, "in no indexed block");
  const directory = join(EXTRACTED_DIRECTORY, "locomotion", body);
  await rm(directory, { force: true, recursive: true });
  await exportClipBlocks(clipPattern, blocks, directory);
  const readings: LocomotionClipReading[] = (await readExportedClips<ExportedLocomotionClip>(directory)).map((clip) =>
    computeLocomotionClipReading(clip, humanScale),
  );
  await writeFile(join(directory, "locomotion.json"), JSON.stringify(readings));
  return readings;
};
