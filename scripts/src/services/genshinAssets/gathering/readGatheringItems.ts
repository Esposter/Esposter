import type { GatherRow } from "#src/models/genshinAssets/gathering/GatherRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";
import type { InteractiveMapLabel } from "#src/models/genshinAssets/points/InteractiveMapLabel";
import type { GatheringItem } from "genshin-world";

import {
  CATEGORY_RESPAWN_MAP,
  GATHER_POINT_LOCATION_GROUND,
  GATHER_SAVE_TYPE_NONE,
  GATHER_TABLE_FILENAME,
} from "#src/services/genshinAssets/gathering/constants";
import { MATERIAL_TABLE_FILENAME } from "#src/services/genshinAssets/items/constants";
import { flattenLabelTree } from "#src/services/genshinAssets/points/flattenLabelTree";
import { EXCEL_DIRECTORY } from "#src/services/genshinText/constants";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameLanguage, GameTextKeys } from "genshin-text";
import { MaterialType } from "genshin-world";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The plants and specialties the gathering points give. An item is one when the gather table picks it off the ground, and
// Its English name is the name of a label the official map files under a category that respawns, which is the label
// Its points are marked by. Returns the items, and each label's item by the label's id, the first item of a name taking
// The label where two items share one. An item of a material type the world does not name is left out
export const readGatheringItems = async (
  labels: InteractiveMapLabel[],
): Promise<{ items: GatheringItem[]; labelItemIdMap: Map<number, number> }> => {
  const [gatherContent, materialContent] = await Promise.all([
    readFile(join(EXCEL_DIRECTORY, GATHER_TABLE_FILENAME), "utf8"),
    readFile(join(EXCEL_DIRECTORY, MATERIAL_TABLE_FILENAME), "utf8"),
  ]);
  const gatherRows = parseMachineJson<GatherRow[]>(gatherContent);
  const materialRows = parseMachineJson<MaterialRow[]>(materialContent);
  const englishText = readTextMap(GameLanguage.English);
  const categoryLabels = flattenLabelTree(labels).filter(({ categoryId }) => CATEGORY_RESPAWN_MAP[categoryId]);
  const materialRowMap = new Map(materialRows.map((materialRow) => [materialRow.id, materialRow]));
  const itemIds = [
    ...new Set(
      gatherRows
        .filter(
          ({ pointLocation, saveType }) =>
            pointLocation === GATHER_POINT_LOCATION_GROUND && saveType !== GATHER_SAVE_TYPE_NONE,
        )
        .map(({ itemId }) => itemId),
    ),
  ].toSorted((firstId, secondId) => firstId - secondId);
  const items: GatheringItem[] = [];
  const labelItemIdMap = new Map<number, number>();
  for (const itemId of itemIds) {
    const materialRow = materialRowMap.get(itemId);
    if (!materialRow)
      throw new InvalidOperationError(Operation.Read, String(itemId), "has no row in the material table");
    const name = englishText.get(String(materialRow.nameTextMapHash));
    const matchedLabels = categoryLabels.filter((label) => name !== undefined && label.name === name);
    const [firstLabel] = matchedLabels;
    const respawn = firstLabel && CATEGORY_RESPAWN_MAP[firstLabel.categoryId];
    const materialType = Object.values(MaterialType).find((type) => type === materialRow.materialType);
    if (!firstLabel || !respawn || !materialType) continue;
    const nameTextId = GameTextKeys.find((gameTextKey) => gameTextKey === String(materialRow.nameTextMapHash));
    if (!nameTextId) throw new InvalidOperationError(Operation.Read, String(itemId), "names no game text key");
    items.push({
      id: itemId,
      materialType,
      nameTextId,
      rank: materialRow.rank,
      rarity: materialRow.rankLevel,
      respawn,
      stackLimit: materialRow.stackLimit,
    });
    for (const { id } of matchedLabels) if (!labelItemIdMap.has(id)) labelItemIdMap.set(id, itemId);
  }
  return { items, labelItemIdMap };
};
