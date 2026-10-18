import { buildEnemyCamps } from "#src/services/genshinAssets/camps/buildEnemyCamps";
import { FamilyLabelEnemyKindIdMap } from "#src/services/genshinAssets/camps/FamilyLabelEnemyKindIdMap";
import { replaceEnemyCamps } from "#src/services/genshinAssets/camps/replaceEnemyCamps";
import { flattenLabelTree } from "#src/services/genshinAssets/points/flattenLabelTree";
import { InteractiveMapRegionMap } from "#src/services/genshinAssets/points/InteractiveMapRegionMap";
import { placeFittedMapPoints } from "#src/services/genshinAssets/points/placeFittedMapPoints";
import { readInteractiveMapLabels } from "#src/services/genshinAssets/points/readInteractiveMapLabels";
import { readFittedRegions } from "#src/services/genshinAssets/residents/readFittedRegions";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";

// Each fitted region's enemy camps, clustered from the official map's enemy marks of the families the camp map names, in
// Place of the camps an earlier run wrote. A dry run counts them and writes nothing
export const fitRegionCamps = async ({ isDryRun }: { isDryRun: boolean }): Promise<string> => {
  const labelIdKindMap = new Map(
    flattenLabelTree(await readInteractiveMapLabels())
      .filter(({ name }) => Object.hasOwn(FamilyLabelEnemyKindIdMap, name))
      .map(({ id, name }) => [id, FamilyLabelEnemyKindIdMap[name]]),
  );
  const placement = await placeFittedMapPoints(labelIdKindMap, "enemy");
  const { regionFiles } = await readFittedRegions();
  const reports = await Promise.all(
    regionFiles
      .filter(({ region }) => region in InteractiveMapRegionMap)
      .map(async ({ data, file, region }) => {
        const enemyCamps = buildEnemyCamps(region, placement.places[region] ?? []);
        if (JSON.stringify(enemyCamps) !== JSON.stringify(data.enemyCamps ?? []) && !isDryRun)
          await writeWorldData(file, replaceEnemyCamps(data, enemyCamps));
        return `${region}: ${enemyCamps.length} camps, ${enemyCamps.reduce((count, { members }) => count + members.length, 0)} enemies`;
      }),
  );
  return isDryRun ? [...reports, "nothing written"].join("\n") : reports.join("\n");
};
