import type { SubCommandsDef } from "citty";

import { RegionCapitalMap } from "#src/services/genshinAssets/fit/RegionCapitalMap";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { buildCityAreas } from "#src/services/genshinAssets/world/buildCityAreas";
import { getCityStreamName } from "#src/services/genshinAssets/world/getCityStreamName";
import { readCapitalWorldPlace } from "#src/services/genshinAssets/world/readCapitalWorldPlace";
import { selectCapitalCityArea } from "#src/services/genshinAssets/world/selectCapitalCityArea";
import { defineCommand } from "citty";

export const cityAreasCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Read every city area's placement extent and centroid from the install, cached per game version, and print the city area each region's capital selects",
    name: "city-areas",
  },
  run: async () => {
    const { areas, candidateCount, gameVersion } = await buildCityAreas();
    const lines = [`${candidateCount} city area candidates, ${areas.length} with placements, game ${gameVersion}`];
    for (const region of Object.keys(RegionCapitalMap)) {
      const place = await readCapitalWorldPlace(parseDerivedAssetComponent(region));
      const area = selectCapitalCityArea(areas, place);
      lines.push(
        `${region}: ${area ? `${getCityStreamName(area.code)}, ${area.placementCount} placements` : "no city area"}`,
      );
    }
    console.log(lines.join("\n"));
  },
});
