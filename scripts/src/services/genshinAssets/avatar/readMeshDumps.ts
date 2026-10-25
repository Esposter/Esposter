import type { DumpedMesh } from "#src/models/genshinAssets/avatar/DumpedMesh";
import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { readName } from "#src/services/genshinAssets/avatar/readName";
import { exportBlockBySource } from "#src/services/genshinAssets/shared/exportBlockBySource";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";

// Every mesh's dump, read from the folder of the CAB it lies in: a block's meshes are exported folder by folder per CAB,
// So a mesh's name names it only within its own CAB, and a mesh of another CAB with the same name is never read in its place
export const readMeshDumps = async (
  meshes: readonly ResolvedObject[],
  names: ReadonlyMap<string, string>,
  directory: string,
): Promise<Map<string, DumpedMesh>> => {
  for (const block of new Set(meshes.map((mesh) => mesh.block)))
    // oxlint-disable-next-line no-await-in-loop -- AnimeStudio exports one block at a time
    await exportBlockBySource(block, [AssetType.Mesh], AnimeStudioExportType.Json, directory);
  const entries = await Promise.all(
    meshes.map(async (mesh): Promise<[string, DumpedMesh]> => {
      const key = toObjectKey(mesh.file, mesh.pathId);
      const path = join(
        directory,
        basename(mesh.block, ".blk"),
        AssetType.Mesh,
        mesh.file,
        `${readName(names, mesh)}.json`,
      );
      return [key, parseMachineJson<DumpedMesh>(await readFile(path, "utf8"))];
    }),
  );
  return new Map(entries);
};
