import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// Every clip `exportClipBlocks` wrote under the directory, parsed, one block's clips read at a time
export const readExportedClips = async <Clip>(directory: string): Promise<Clip[]> => {
  const clips: Clip[] = [];
  for (const block of await readdir(directory)) {
    const clipDirectory = join(directory, block, AssetType.AnimationClip);
    if (!existsSync(clipDirectory)) continue;
    // oxlint-disable-next-line no-await-in-loop -- one block's clips are read at a time
    for (const file of await readdir(clipDirectory)) {
      // oxlint-disable-next-line no-await-in-loop -- as above
      clips.push(parseMachineJson<Clip>(await readFile(join(clipDirectory, file), "utf8")));
    }
  }
  return clips;
};
