import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";

import { computeWaterfallSheet } from "#src/services/genshinAssets/fit/computeWaterfallSheet";
import { readWitnessWorldMeshes } from "#src/services/genshinAssets/fit/readWitnessWorldMeshes";
import { writeRegionKey } from "#src/services/genshinAssets/fit/writeRegionKey";

const WATERFALL_MESH_PREFIX = "Eff_Model_WaterFall_";

// A region's waterfalls, each sheet read off its fall's mesh as the witness lays it out: every placement of one, its
// Vertices turned into three's axes first and then carried into the world by its scale, turn and place. The layout's
// Placements are already in three's axes round the origin, so nothing after the placement flips them again, and each
// Mesh is read as one sheet, or none where its lip has no width. Written to the region's data file as its `waterfalls`,
// Returning the file's path as the build's note, with the count of sheets. A dry run writes nothing and says so
export const fitWaterfallSheets = async (
  component: DerivedAssetComponent,
  { isDryRun }: DryRunOptions,
): Promise<GameDataBuild> => {
  const sheets = (await readWitnessWorldMeshes(component, (mesh) => mesh.startsWith(WATERFALL_MESH_PREFIX))).map(
    (vertices) => computeWaterfallSheet(vertices),
  );
  const waterfalls = sheets.filter((sheet) => sheet !== undefined);
  const note = await writeRegionKey(component, "waterfalls", waterfalls, `${waterfalls.length} waterfall sheets`, {
    isDryRun,
  });
  return { notes: [note], objects: {} };
};
