import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { readKitOverlay } from "#src/services/genshinAssets/kits/readKitOverlay";
import { getKitDonorCharacterIds } from "#src/services/genshinAssets/kits/record/getKitDonorCharacterIds";
import { readKitTables } from "#src/services/genshinAssets/kits/tables/readKitTables";
import { toKebabCase } from "@esposter/shared";

// The tables of the given characters and of every character their overlays borrow from, the donors' donors included,
// Since a borrower is built after each donor. Each round reads the characters the last round's overlays name, so a
// Round adds only characters not yet read, and the loop ends once no overlay names a new one
export const readKitTablesWithDonors = async (characterIds: readonly number[]): Promise<Map<number, KitTables>> => {
  const tablesMap = new Map<number, KitTables>();
  let pending = [...new Set(characterIds)];
  while (pending.length > 0) {
    // oxlint-disable-next-line no-await-in-loop -- each round reads the donors the round before its overlays named
    const readMap = await readKitTables(pending);
    for (const [characterId, tables] of readMap) tablesMap.set(characterId, tables);
    pending = [
      ...new Set(
        [...readMap.values()].flatMap(({ name }) => getKitDonorCharacterIds(readKitOverlay(toKebabCase(name)))),
      ),
    ].filter((characterId) => !tablesMap.has(characterId));
  }
  return tablesMap;
};
