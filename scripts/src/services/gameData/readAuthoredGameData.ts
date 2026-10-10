import { AGE_RATING_KEY } from "#src/services/gameData/constants";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readRegionGroundFiles } from "#src/services/genshinAssets/shared/readRegionGroundFiles";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { GameDataset } from "genshin-world";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The world's authored data files, which people edit and no step generates, as the records they publish under: the
// Catalogue, each region's ground and the login's age rating, read as the world package commits them
export const readAuthoredGameData = async (): Promise<Record<string, unknown>> => {
  const [catalogueJson, regionGroundMap, ageRatingJson] = await Promise.all([
    readFile(join(WORLD_DATA_DIRECTORY, "catalogue.json"), "utf8"),
    readRegionGroundFiles(),
    readFile(join(WORLD_DATA_DIRECTORY, `${AGE_RATING_KEY}.json`), "utf8"),
  ]);
  return {
    [`${GameDataset.Catalogue}/catalogue`]: parseMachineJson(catalogueJson),
    ...Object.fromEntries(
      Object.entries(regionGroundMap).map(([region, ground]) => [`${GameDataset.Ground}/${region}`, ground]),
    ),
    [AGE_RATING_KEY]: parseMachineJson(ageRatingJson),
  };
};
