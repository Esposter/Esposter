import type { MapPointPlacement } from "#src/models/genshinAssets/points/MapPointPlacement";

import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Each region's places written as one slice in the given generated folder, which the world imports on demand. The folder
// Is cleared first, so a region left with no places keeps no slice from an earlier run. The report counts each region's
// Places under the noun, then what was left out
export const writeMapPointSlices = async <Kind>(
  directory: string,
  placement: MapPointPlacement<Kind>,
  noun: string,
): Promise<string> => {
  await rm(directory, { force: true, recursive: true });
  await mkdir(directory, { recursive: true });
  const regions = Object.entries(placement.places).toSorted(([firstRegion], [secondRegion]) =>
    firstRegion.localeCompare(secondRegion),
  );
  await Promise.all(
    regions.map(([region, regionPlaces]) =>
      writeFile(join(directory, `${region}.json`), `${JSON.stringify(regionPlaces)}\n`),
    ),
  );
  return [
    ...regions.map(([region, regionPlaces]) => `${region}: ${regionPlaces.length} ${noun}`),
    `${placement.skippedUnderground} on the layers under the ground and ${placement.skippedUnmapped} in no mapped region, left out`,
  ].join("\n");
};
