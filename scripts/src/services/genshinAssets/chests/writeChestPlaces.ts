import type { InteractiveMapFitFile } from "#src/models/genshinAssets/points/InteractiveMapFitFile";

import { CHEST_PLACES_GENERATED_DIRECTORY } from "#src/services/genshinAssets/chests/constants";
import { placeChests } from "#src/services/genshinAssets/chests/placeChests";
import { INTERACTIVE_MAP_FIT_PATH } from "#src/services/genshinAssets/points/constants";
import { readInteractiveMapPoints } from "#src/services/genshinAssets/points/readInteractiveMapPoints";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Each region's chests written as one slice in the world's generated folder, from the official map's points and the fit
// The fit writes the transform, so the fit must have run. The report counts each region's chests and what was left out
export const writeChestPlaces = async (): Promise<string> => {
  const [points, fitContent] = await Promise.all([
    readInteractiveMapPoints(),
    readFile(INTERACTIVE_MAP_FIT_PATH, "utf8"),
  ]);
  const fitFile = parseMachineJson<InteractiveMapFitFile>(fitContent);
  const { places, skippedUnderground, skippedUnmapped } = placeChests(points, fitFile.transform);
  await mkdir(CHEST_PLACES_GENERATED_DIRECTORY, { recursive: true });
  const regions = Object.entries(places).toSorted(([firstRegion], [secondRegion]) =>
    firstRegion.localeCompare(secondRegion),
  );
  await Promise.all(
    regions.map(([region, regionPlaces]) =>
      writeFile(join(CHEST_PLACES_GENERATED_DIRECTORY, `${region}.json`), `${JSON.stringify(regionPlaces)}\n`),
    ),
  );
  return [
    ...regions.map(([region, regionPlaces]) => `${region}: ${regionPlaces.length} chests`),
    `${skippedUnderground} on the layers under the ground and ${skippedUnmapped} in no mapped region, left out`,
  ].join("\n");
};
