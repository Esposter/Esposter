import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SceneLayout } from "genshin-engine";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { computeWaterfallSheet } from "#src/services/genshinAssets/fit/computeWaterfallSheet";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { WITNESS_LAYOUT_FILE_NAME } from "genshin-world/sceneExport";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Quaternion, Vector3 } from "three";

const WATERFALL_MESH_REGEX = /^Eff_Model_WaterFall_/u;

// A region's waterfalls, each sheet read off its fall's mesh as the witness lays it out: every placement of one, its
// Vertices carried into the world by its scale, turn and place in that order, as a lathe's are, and each mesh read as one
// Sheet. Written to the region's data file as its `waterfalls`, returning the file's path as the build's note
export const fitWaterfallSheets = async (component: DerivedAssetComponent): Promise<GameDataBuild> => {
  const { assets, root } = getComponentDirectory(component);
  const layout = parseMachineJson<SceneLayout>(await readFile(join(root, WITNESS_LAYOUT_FILE_NAME), "utf8"));
  const waterfalls = await Promise.all(
    layout.placements
      .filter(({ mesh }) => WATERFALL_MESH_REGEX.test(mesh))
      .map(async ({ mesh, position, rotation, scale }) => {
        const { vertices } = await readObjMesh(join(assets, AssetType.Mesh, `${mesh}.obj`));
        const stretch = new Vector3(...scale);
        const turn = new Quaternion(...rotation);
        const offset = new Vector3(...position);
        return computeWaterfallSheet(
          vertices.map((vertex) =>
            new Vector3(...toRightHanded(vertex)).multiply(stretch).applyQuaternion(turn).add(offset),
          ),
        );
      }),
  );
  const regionFile = join("regions", `${component}.json`);
  const regionData = parseMachineJson<Record<string, unknown>>(
    await readFile(join(WORLD_DATA_DIRECTORY, regionFile), "utf8"),
  );
  return { notes: [await writeWorldData(regionFile, { ...regionData, waterfalls })], objects: {} };
};
