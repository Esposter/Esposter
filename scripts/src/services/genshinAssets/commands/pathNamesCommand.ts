import type { SubCommandsDef } from "citty";

import { RegionCapitalMap } from "#src/services/genshinAssets/fit/RegionCapitalMap";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { buildDerivedPathNames } from "#src/services/genshinAssets/world/buildDerivedPathNames";
import { readCityPathKeys } from "#src/services/genshinAssets/world/readCityPathKeys";
import { defineCommand } from "citty";

export const pathNamesCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Name the prefab paths of each extracted capital's city blob that the community's index does not, by hashing the paths the asset index's folders give, into the derived index beside the community's",
    name: "path-names",
  },
  run: async () => {
    const regionKeysMap = new Map<string, string[] | undefined>();
    for (const region of Object.keys(RegionCapitalMap))
      regionKeysMap.set(region, await readCityPathKeys(parseDerivedAssetComponent(region)));
    const keys = new Set(Array.from(regionKeysMap.values()).flatMap((regionKeys) => regionKeys ?? []));
    const matches = await buildDerivedPathNames(keys);
    const regionLines = Array.from(regionKeysMap, ([region, regionKeys]) => {
      if (!regionKeys) return `${region}: no extracted city blob`;
      const named = regionKeys.filter((key) => matches.has(key)).length;
      return `${region}: ${named} of ${regionKeys.length} city path hashes named`;
    });
    console.log(
      [`${matches.size} of ${keys.size} path hashes named, written to the derived index`, ...regionLines].join("\n"),
    );
  },
});
