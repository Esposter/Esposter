import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { computeWaterfallSheet } from "#src/services/genshinAssets/fit/computeWaterfallSheet";
import { readWitnessWorldMeshes } from "#src/services/genshinAssets/fit/readWitnessWorldMeshes";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const WATERFALL_MESH_PREFIX = "Eff_Model_WaterFall_";

// A region's waterfalls, each sheet read off its fall's mesh as the witness lays it out: every placement of one, its
// Vertices turned into three's axes first and then carried into the world by its scale, turn and place. The layout's
// Placements are already in three's axes round the origin, so nothing after the placement flips them again, and each
// Mesh is read as one sheet, or none where its lip has no width. Written to the region's data file as its `waterfalls`,
// Returning the file's path as the build's note
export const fitWaterfallSheets = async (component: DerivedAssetComponent): Promise<GameDataBuild> => {
  const sheets = (await readWitnessWorldMeshes(component, (mesh) => mesh.startsWith(WATERFALL_MESH_PREFIX))).map(
    (vertices) => computeWaterfallSheet(vertices),
  );
  const waterfalls = sheets.filter((sheet) => sheet !== undefined);
  const regionFile = join("regions", `${component}.json`);
  const regionData = parseMachineJson<Record<string, unknown>>(
    await readFile(join(WORLD_DATA_DIRECTORY, regionFile), "utf8"),
  );
  return { notes: [await writeWorldData(regionFile, { ...regionData, waterfalls })], objects: {} };
};
