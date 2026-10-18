import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";
import type { ExcelShopRotateRow } from "#src/models/genshinAssets/shops/ExcelShopRotateRow";
import type { ExcelMaterialRow } from "#src/models/genshinAssets/stats/ExcelMaterialRow";

import {
  GAIN_AVATAR_ITEM_USE,
  PAIMON_BARGAINS_BLACKCLIFF_ORDER,
  PAIMON_BARGAINS_CHARACTER_ROTATE_IDS,
  PAIMON_BARGAINS_PAIR_COUNT,
  PAIMON_BARGAINS_ROYAL_ORDER,
  PAIMON_BARGAINS_SHOP_TYPE,
  PAIMON_BARGAINS_WEAPON_ROTATE_IDS,
} from "#src/services/genshinAssets/shops/constants";
import { getShopGoodPrice } from "#src/services/genshinAssets/shops/getShopGoodPrice";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// The price and monthly limit a Paimon's Bargains set is sold at, as its goods give them
interface PaimonsBargainsPrice {
  buyLimit: number;
  priceCount: number;
  priceItemId: number;
}

// Paimon's Bargains' rotation as one record of the shops dataset: the pairs of characters, each pair the avatars that the
// Two character rotations give at the same order, read through their cards' item use, and the Royal and Blackcliff weapon
// Sets, which the weapon rotations give at the Royal order and the Blackcliff order, and the price and monthly limit each
// Set's goods give, read from the goods of its rotation. A missing order or a rotation priced two ways is an error
export const buildPaimonsBargainsRotation = (): Record<string, unknown> => {
  const rotationRows = readExcelTable<ExcelShopRotateRow>("ShopRotateExcelConfigData");
  const goodRows = readExcelTable<ExcelShopGoodsRow>("ShopGoodsExcelConfigData");
  const cardIdAvatarIdMap = new Map(
    readExcelTable<ExcelMaterialRow>("MaterialExcelConfigData").flatMap(({ id, itemUse }) => {
      const avatarUse = itemUse.find(({ useOp }) => useOp === GAIN_AVATAR_ITEM_USE);
      return avatarUse ? [[id, Number(avatarUse.useParam[0])] as const] : [];
    }),
  );
  // The price and monthly limit of a rotation's goods, the same for every rotation of a set, which the table gives on each
  // Good of the rotation by its rotate id
  const priceOfRotations = (rotateIds: readonly number[]): PaimonsBargainsPrice => {
    const prices = rotateIds.map((rotateId) => {
      const row = goodRows.find(
        (goodRow) => goodRow.shopType === PAIMON_BARGAINS_SHOP_TYPE && goodRow.rotateId === rotateId,
      );
      const price = row && getShopGoodPrice(row);
      if (!row || !price)
        throw new InvalidOperationError(
          Operation.Read,
          "Paimon's Bargains rotation",
          `rotation ${rotateId} has no priced good`,
        );
      return { buyLimit: row.buyLimit, priceCount: price.count, priceItemId: price.id };
    });
    const [price] = prices;
    if (!price || prices.some((other) => !isSamePrice(other, price)))
      throw new InvalidOperationError(
        Operation.Read,
        "Paimon's Bargains rotation",
        `rotations ${rotateIds.join(", ")} are priced two ways`,
      );
    return price;
  };
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
    const avatarId = cardIdAvatarIdMap.get(cardId);
    if (avatarId === undefined)
      throw new InvalidOperationError(Operation.Read, "Paimon's Bargains rotation", `card ${cardId} gives no avatar`);
    return avatarId;
  };
  const [firstCharacterRotateId, secondCharacterRotateId] = PAIMON_BARGAINS_CHARACTER_ROTATE_IDS;
  const characterPairs = Array.from({ length: PAIMON_BARGAINS_PAIR_COUNT }, (_value, index) => [
    avatarIdAt(firstCharacterRotateId, index + 1),
    avatarIdAt(secondCharacterRotateId, index + 1),
  ]);
  const rotation = {
    blackcliffWeaponIds: PAIMON_BARGAINS_WEAPON_ROTATE_IDS.map((rotateId) =>
      itemIdAt(rotateId, PAIMON_BARGAINS_BLACKCLIFF_ORDER),
    ),
    characterPairs,
    characterPrice: priceOfRotations(PAIMON_BARGAINS_CHARACTER_ROTATE_IDS),
    royalWeaponIds: PAIMON_BARGAINS_WEAPON_ROTATE_IDS.map((rotateId) =>
      itemIdAt(rotateId, PAIMON_BARGAINS_ROYAL_ORDER),
    ),
    weaponPrice: priceOfRotations(PAIMON_BARGAINS_WEAPON_ROTATE_IDS),
  };
  return { [`${GameDataset.Shops}/paimonsBargainsRotation`]: rotation };
};

const isSamePrice = (first: PaimonsBargainsPrice, second: PaimonsBargainsPrice): boolean =>
  first.buyLimit === second.buyLimit &&
  first.priceCount === second.priceCount &&
  first.priceItemId === second.priceItemId;
