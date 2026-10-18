import type {
  PaimonsBargainsGood,
  PaimonsBargainsPrice,
  PaimonsBargainsRotation,
} from "#src/models/shop/PaimonsBargainsRotation";

import { getPaimonsBargainsOffer } from "#src/services/shop/getPaimonsBargainsOffer";
import { takeOne } from "@esposter/shared";

// The goods Paimon's Bargains offers in the game-time month `now` falls in: each character of the month's pair as the good
// Of its slot in the pair, and each weapon of the month's set as the good of its slot in the set, all at the price their
// Rotation gives
export const getPaimonsBargainsGoods = (
  rotation: PaimonsBargainsRotation,
  now: Temporal.Instant,
): { characterGoods: PaimonsBargainsGood[]; weaponGoods: PaimonsBargainsGood[] } => {
  const { characterIds, weaponIds } = getPaimonsBargainsOffer(rotation, now);
  return {
    characterGoods: characterIds.map((characterId, slot) =>
      toGood(takeOne(rotation.characterGoodIds, slot), rotation.characterPrice, characterId),
    ),
    weaponGoods: weaponIds.map((weaponId, slot) =>
      toGood(takeOne(rotation.weaponGoodIds, slot), rotation.weaponPrice, weaponId),
    ),
  };
};

const toGood = (goodsId: number, price: PaimonsBargainsPrice, itemId: number): PaimonsBargainsGood => ({
  buyLimit: price.buyLimit,
  goodsId,
  itemCount: 1,
  itemId,
  priceCount: price.priceCount,
  priceItemId: price.priceItemId,
  refresh: price.refresh,
});
