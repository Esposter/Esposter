import type { ExcelMaterialRow } from "#src/models/genshinAssets/stats/ExcelMaterialRow";
import type { ExcelShopRotateRow } from "#src/models/genshinAssets/shops/ExcelShopRotateRow";

import {
  GAIN_AVATAR_ITEM_USE,
  PAIMON_BARGAINS_BLACKCLIFF_ORDER,
  PAIMON_BARGAINS_CHARACTER_ROTATE_IDS,
  PAIMON_BARGAINS_PAIR_COUNT,
  PAIMON_BARGAINS_ROYAL_ORDER,
  PAIMON_BARGAINS_WEAPON_ROTATE_IDS,
} from "#src/services/genshinAssets/shops/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// Paimon's Bargains' rotation as one record of the shops dataset: the pairs of characters, each pair the avatars that the
// Two character rotations give at the same order, read through their cards' item use, and the Royal and Blackcliff weapon
// Sets, which the weapon rotations give at the Royal order and the Blackcliff order. A missing order is an error
export const buildPaimonsBargainsRotation = (): Record<string, unknown> => {
  const rotationRows = readExcelTable<ExcelShopRotateRow>("ShopRotateExcelConfigData");
  const avatarIdByCardId = new Map(
    readExcelTable<ExcelMaterialRow>("MaterialExcelConfigData").flatMap(({ id, itemUse }) => {
      const avatarUse = itemUse.find(({ useOp }) => useOp === GAIN_AVATAR_ITEM_USE);
      return avatarUse ? [[id, Number(avatarUse.useParam[0])] as const] : [];
    }),
  );
  const itemIdAt = (rotateId: number, rotateOrder: number): number => {
    const row = rotationRows.find(
      (rotationRow) => rotationRow.rotateId === rotateId && rotationRow.rotateOrder === rotateOrder,
    );
    if (!row)
      throw new InvalidOperationError(
        Operation.Read,
        "Paimon's Bargains rotation",
        `rotation ${rotateId} has no order ${rotateOrder}`,
      );
    return row.itemId;
  };
  const avatarIdAt = (rotateId: number, rotateOrder: number): number => {
    const cardId = itemIdAt(rotateId, rotateOrder);
    const avatarId = avatarIdByCardId.get(cardId);
    if (avatarId === undefined)
      throw new InvalidOperationError(Operation.Read, "Paimon's Bargains rotation", `card ${cardId} gives no avatar`);
    return avatarId;
  };
  const [firstCharacterRotateId, secondCharacterRotateId] = PAIMON_BARGAINS_CHARACTER_ROTATE_IDS;
  const characterPairs = Array.from({ length: PAIMON_BARGAINS_PAIR_COUNT }, (_, index) => [
    avatarIdAt(firstCharacterRotateId, index + 1),
    avatarIdAt(secondCharacterRotateId, index + 1),
  ]);
  const rotation = {
    blackcliffWeaponIds: PAIMON_BARGAINS_WEAPON_ROTATE_IDS.map((rotateId) =>
      itemIdAt(rotateId, PAIMON_BARGAINS_BLACKCLIFF_ORDER),
    ),
    characterPairs,
    royalWeaponIds: PAIMON_BARGAINS_WEAPON_ROTATE_IDS.map((rotateId) =>
      itemIdAt(rotateId, PAIMON_BARGAINS_ROYAL_ORDER),
    ),
  };
  return { [`${GameDataset.Shops}/paimonsBargainsRotation`]: rotation };
};
