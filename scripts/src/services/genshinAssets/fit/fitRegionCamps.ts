import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";
import type { EnemyKindId } from "genshin-world";

import { buildEnemyCamps } from "#src/services/genshinAssets/camps/buildEnemyCamps";
import { FamilyLabelEnemyKindIdMap } from "#src/services/genshinAssets/camps/FamilyLabelEnemyKindIdMap";
import { replaceEnemyCamps } from "#src/services/genshinAssets/camps/replaceEnemyCamps";
import { flattenLabelTree } from "#src/services/genshinAssets/points/flattenLabelTree";
import { InteractiveMapRegionMap } from "#src/services/genshinAssets/points/InteractiveMapRegionMap";
import { placeFittedMapPoints } from "#src/services/genshinAssets/points/placeFittedMapPoints";
import { readInteractiveMapLabels } from "#src/services/genshinAssets/points/readInteractiveMapLabels";
import { readFittedRegions } from "#src/services/genshinAssets/residents/readFittedRegions";
import { CATALOGUE_PATH } from "#src/services/genshinAssets/shared/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { catalogueSchema, findAreaAt } from "genshin-world";
import { readFile } from "node:fs/promises";

// Each fitted region's enemy camps, clustered from the official map's enemy marks of the families the camp map names, in
// Place of the camps an earlier run wrote. Each camp takes the catalogue area its enemies stand in, and an enemy in no
// Area is left out and counted, as are the marks on layers under the ground, which have no floor to stand on. A dry run
// Counts them and writes nothing
export const fitRegionCamps = async ({ isDryRun }: { isDryRun: boolean }): Promise<string> => {
  const labelIdKindMap = new Map(
    flattenLabelTree(await readInteractiveMapLabels())
      .filter(({ name }) => Object.hasOwn(FamilyLabelEnemyKindIdMap, name))
      .map(({ id, name }) => [id, FamilyLabelEnemyKindIdMap[name]]),
  );
  const placement = await placeFittedMapPoints(labelIdKindMap, "enemy");
  const catalogue = catalogueSchema.parse(parseMachineJson(await readFile(CATALOGUE_PATH, "utf8")));
  const areaIdAt = (x: number, z: number) => findAreaAt(catalogue, x, z)?.id;
  const { regionFiles } = await readFittedRegions();
  const reports = await Promise.all(
    regionFiles
      .filter(({ region }) => region in InteractiveMapRegionMap)
      .map(async ({ data, file, region }) => {
        const places = (placement.places[region] ?? []).filter(
          (place): place is MapPointPlace<EnemyKindId> => place.kind !== undefined,
        );
        const enemyCamps = buildEnemyCamps(region, places, areaIdAt);
        const enemyCount = enemyCamps.reduce((count, { members }) => count + members.length, 0);
        if (JSON.stringify(enemyCamps) !== JSON.stringify(data.enemyCamps ?? []) && !isDryRun)
          await writeWorldData(file, replaceEnemyCamps(data, enemyCamps));
        return `${region}: ${enemyCamps.length} camps, ${enemyCount} enemies, ${places.length - enemyCount} in no area left out`;
      }),
  );
  const lines = [
    ...reports,
    `${placement.skippedUnderground} marks on layers under the ground have no floor in the data, left out`,
  ];
  return (isDryRun ? [...lines, "nothing written"] : lines).join("\n");
};
