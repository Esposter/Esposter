import { AGE_RATING_KEY, CATALOGUE_KEY } from "#src/services/gameData/constants";
import { checkIsRegionGroundFitted } from "#src/services/genshinAssets/shared/checkIsRegionGroundFitted";
import { CATALOGUE_PATH, WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readRegionGroundFiles } from "#src/services/genshinAssets/shared/readRegionGroundFiles";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The world's authored data files, which people edit and no step generates but the catalogue's outlines
// (`fitAreaOutlines`), as the records they publish under: the catalogue, each region's ground no fit has drawn and the
// Login's age rating, read as the world package commits them. A ground file whose region a fit has since drawn is
// Refused, since publishing it would put the plateaus back in place of the fitted ground
export const readAuthoredGameData = async (): Promise<Record<string, unknown>> => {
  const [catalogueJson, regionGroundMap, ageRatingJson] = await Promise.all([
    readFile(CATALOGUE_PATH, "utf8"),
    readRegionGroundFiles(),
    readFile(join(WORLD_DATA_DIRECTORY, `${AGE_RATING_KEY}.json`), "utf8"),
  ]);
  await Promise.all(
    Object.keys(regionGroundMap).map(async (region) => {
      if (await checkIsRegionGroundFitted(region))
        throw new InvalidOperationError(
          Operation.Read,
          join(region, "ground.json"),
          `is no longer its region's ground, which a fit has drawn as pieces under ${GameDataset.Ground}/${region}/: delete the file`,
        );
    }),
  );
  return {
    [CATALOGUE_KEY]: parseMachineJson(catalogueJson),
    ...Object.fromEntries(
      Object.entries(regionGroundMap).map(([region, ground]) => [`${GameDataset.Ground}/${region}`, ground]),
    ),
    [AGE_RATING_KEY]: parseMachineJson(ageRatingJson),
  };
};
