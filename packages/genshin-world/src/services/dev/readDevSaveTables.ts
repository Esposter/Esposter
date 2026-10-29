import type { DevSaveTables } from "#src/models/dev/DevSaveTables";
import type { GameLanguage, GameText } from "genshin-text";

import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { readStatTables } from "#src/services/character/readStatTables";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { createReliquaryPieceEntryMap } from "#src/services/reliquary/createReliquaryPieceEntryMap";
import { readReliquarySets } from "#src/services/reliquary/readReliquarySets";
import { readCatalogue } from "#src/services/world/readCatalogue";
import { readRegionData } from "#src/services/world/readRegionData";
import { getResultAsync } from "@esposter/shared";

// The records a save command reads the names and the rules of the save from, read as the world reads them: the names in
// the reader's language, the item, character and rank tables, the catalogue, and each region's waypoints. A region whose
// data fails is logged and left out, as the map leaves it out
export const readDevSaveTables = async (
  gameDataBaseUrl: string,
  regionDataBaseUrl: string,
  language: GameLanguage,
  gameText: GameText,
): Promise<DevSaveTables> => {
  const [nameText, materialDataMap, statTables, reliquarySets, adventureRankTables, catalogue] = await Promise.all([
    NameTextLoaderMap[language](gameDataBaseUrl),
    readMaterialDataMap(gameDataBaseUrl),
    readStatTables(gameDataBaseUrl),
    readReliquarySets(gameDataBaseUrl),
    readAdventureRankTables(gameDataBaseUrl),
    readCatalogue(gameDataBaseUrl),
  ]);
  const regionLandmarks = await Promise.all(
    catalogue.regions.map(({ id }) =>
      getResultAsync(() => readRegionData(regionDataBaseUrl, id)).match(
        ({ landmarks }) => landmarks,
        (error) => {
          console.error(error);
          return [];
        },
      ),
    ),
  );

  return {
    adventureRankLevels: adventureRankTables.levels,
    catalogue,
    characterDataMap: statTables.characterDataMap,
    gameText,
    materialDataMap,
    nameText,
    reliquaryPieceEntryMap: createReliquaryPieceEntryMap(reliquarySets),
    waypointLandmarks: regionLandmarks.flat().filter((landmark) => landmark.kind === LandmarkKind.TeleportWaypoint),
    weaponDataMap: statTables.weaponDataMap,
  };
};
