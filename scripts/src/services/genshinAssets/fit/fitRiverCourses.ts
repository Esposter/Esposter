import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { computeRiverCourses } from "#src/services/genshinAssets/fit/computeRiverCourses";
import { readWitnessWorldMeshes } from "#src/services/genshinAssets/fit/readWitnessWorldMeshes";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The water surfaces the game places along a river, named Area_<region>_Water_* in the witness
const WATER_MESH_INFIX = "_Water_";

// A region's rivers, each water surface's mesh read as the witness lays it out, the same way its falls are. A surface
// Is one or more courses, and a pond has none. Written to the region's data file as its `rivers`, returning the file's
// Path and the counts of courses and points as the build's note. A dry run writes nothing and says so
export const fitRiverCourses = async (
  component: DerivedAssetComponent,
  { isDryRun }: { isDryRun: boolean },
): Promise<GameDataBuild> => {
  const courses = (await readWitnessWorldMeshes(component, (mesh) => mesh.includes(WATER_MESH_INFIX))).map((vertices) =>
    computeRiverCourses(vertices),
  );
  const rivers = courses.flat();
  const regionFile = join("regions", `${component}.json`);
  const regionData = parseMachineJson<Record<string, unknown>>(
    await readFile(join(WORLD_DATA_DIRECTORY, regionFile), "utf8"),
  );
  const path = await writeWorldData(regionFile, { ...regionData, rivers }, { isDryRun });
  const points = rivers.reduce((sum, course) => sum + course.length, 0);
  const written = isDryRun ? ", nothing written" : "";
  return { notes: [`${path}: ${rivers.length} river courses, ${points} course points${written}`], objects: {} };
};
