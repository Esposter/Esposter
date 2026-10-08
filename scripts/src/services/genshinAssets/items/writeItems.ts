import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { MATERIAL_TABLE_FILENAME, MATERIALS_PATH } from "#src/services/genshinAssets/items/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { EXCEL_DIRECTORY } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameTextKeys } from "genshin-text";
import { EnemyDropFamilyDropTableMap } from "genshin-world";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The items every drop family's table names, each read from the game's material table with its name's text id, which
// Must be a key of the game text so the world can show it. An item the table lacks, or a name no key holds, is an
// Error. Returns the file's path
export const writeItems = async (): Promise<string> => {
  const itemIds = [
    ...new Set(
      Object.values(EnemyDropFamilyDropTableMap).flatMap(({ materials }) => materials.map(({ itemId }) => itemId)),
    ),
  ].toSorted((firstId, secondId) => firstId - secondId);
  const materialRows = parseMachineJson<MaterialRow[]>(
    await readFile(join(EXCEL_DIRECTORY, MATERIAL_TABLE_FILENAME), "utf8"),
  );
  const items = itemIds.map((itemId) => {
    const materialRow = materialRows.find(({ id }) => id === itemId);
    if (!materialRow)
      throw new InvalidOperationError(Operation.Read, String(itemId), "has no row in the material table");
    const nameTextId = String(materialRow.nameTextMapHash);
    if (!GameTextKeys.some((gameTextKey) => gameTextKey === nameTextId))
      throw new InvalidOperationError(Operation.Read, String(itemId), "names no game text key");
    return {
      id: materialRow.id,
      materialType: materialRow.materialType,
      nameTextId,
      rank: materialRow.rank,
      rarity: materialRow.rankLevel,
      stackLimit: materialRow.stackLimit,
    };
  });
  return writeWorldData(MATERIALS_PATH, items);
};
