import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";

import { computeRiverCourses } from "#src/services/genshinAssets/fit/computeRiverCourses";
import { readWitnessWorldMeshes } from "#src/services/genshinAssets/fit/readWitnessWorldMeshes";
import { writeRegionKey } from "#src/services/genshinAssets/fit/writeRegionKey";

// The water surfaces the game places along a river, named Area_<region>_Water_* in the witness
const WATER_MESH_INFIX = "_Water_";

// A region's rivers, each water surface's mesh read as the witness lays it out, the same way its falls are. A surface
// Is one or more courses, and a pond has none. Written to the region's data file as its `rivers`, returning the file's
// Path and the counts of courses and points as the build's note. A dry run writes nothing and says so
export const fitRiverCourses = async (
  component: DerivedAssetComponent,
  { isDryRun }: DryRunOptions,
): Promise<GameDataBuild> => {
  const courses = (await readWitnessWorldMeshes(component, (mesh) => mesh.includes(WATER_MESH_INFIX))).map((vertices) =>
    computeRiverCourses(vertices),
  );
  const rivers = courses.flat();
  const points = rivers.reduce((sum, course) => sum + course.length, 0);
  const note = await writeRegionKey(
    component,
    "rivers",
    rivers,
    `${rivers.length} river courses, ${points} course points`,
    { isDryRun },
  );
  return { notes: [note], objects: {} };
};
