import type { DumpedSkinnedMeshRenderer } from "#src/models/genshinAssets/shared/DumpedSkinnedMeshRenderer";

import { reviveSourcePathId } from "#src/services/genshinAssets/shared/reviveSourcePathId";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// One CAB's skinned renderer dumps, each read with its path IDs as their source text
export const readCabRenderers = async (cabDirectory: string): Promise<DumpedSkinnedMeshRenderer[]> =>
  Promise.all(
    (await readdir(cabDirectory)).map(async (name) =>
      parseMachineJson<DumpedSkinnedMeshRenderer>(await readFile(join(cabDirectory, name), "utf8"), reviveSourcePathId),
    ),
  );
