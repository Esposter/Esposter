import { GATHERING_GENERATED_DIRECTORY, GATHERING_ITEMS_PATH } from "#src/services/genshinAssets/gathering/constants";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readGatheringItems } from "#src/services/genshinAssets/gathering/readGatheringItems";
import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { readInteractiveMapLabels } from "#src/services/genshinAssets/points/readInteractiveMapLabels";
import { writeMapPointSlices } from "#src/services/genshinAssets/points/writeMapPointSlices";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { mkdir, writeFile } from "node:fs/promises";

// Each region's gathering points written as one slice in the world's generated folder, each point the official map marks
// Of a gathering item and placed by the fit, with the items they give as one table beside them. A point's kind is its
// Item's id. The report counts each region's points and what was left out
export const writeGatheringPlaces = async (): Promise<string> => {
  const [origin, labels, { points, transform }] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readInteractiveMapLabels(),
    readFittedMapPoints(),
  ]);
  const { items, labelItemIdMap } = await readGatheringItems(labels);
  const placement = placeMapPoints(points, transform, labelItemIdMap, "gathering", origin);
  await mkdir(GATHERING_GENERATED_DIRECTORY, { recursive: true });
  const report = await writeMapPointSlices(GATHERING_GENERATED_DIRECTORY, placement, "gathering points");
  await writeFile(GATHERING_ITEMS_PATH, `${JSON.stringify(items, undefined, 2)}\n`);
  return `${report}\n${items.length} gathering items written`;
};
