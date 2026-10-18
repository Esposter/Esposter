import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { PaimonsBargainsGood } from "#src/models/shop/PaimonsBargainsRotation";

import { Currency } from "#src/models/inventory/Currency";
import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { buyPaimonsBargainsWeapon } from "#src/services/shop/buyPaimonsBargainsWeapon";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(buyPaimonsBargainsWeapon, () => {
  const WEAPON_ID = 13_502;
  const WEAPON_PRICE = 4;
  const STARGLITTER_ITEM_ID = 221;
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  // Forty days past the epoch, a morning in February, after the month's refresh on its first
  const NOW = EPOCH.add({ hours: 24 * 40 });
  const definition: ItemDefinition = {
    category: ItemCategory.Weapon,
    id: WEAPON_ID,
    name: "Weapon",
    rank: 1,
    rarity: 3,
    stackLimit: 1,
  };
  const getWeaponDefinition = () => definition;
  const good: PaimonsBargainsGood = {
    buyLimit: 3,
    goodsId: 102_007,
    itemCount: 1,
    itemId: WEAPON_ID,
    priceCount: WEAPON_PRICE,
    priceItemId: STARGLITTER_ITEM_ID,
    refresh: ShopRefresh.Monthly,
  };
  const wallet = { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: WEAPON_PRICE * 2 };

  test("a weapon is put in the bag and its price is taken", () => {
    expect.hasAssertions();

    const result = buyPaimonsBargainsWeapon(wallet, EMPTY_INVENTORY, [], good, getWeaponDefinition, NOW);

    expect(result).toStrictEqual({
      inventory: { items: [{ definition, id: 0, level: 1, quantity: 1 }], nextId: 1 },
      purchases: [{ count: 1, goodsId: good.goodsId, lastPurchasedAt: NOW }],
      wallet: { ...wallet, [Currency.MasterlessStarglitter]: WEAPON_PRICE },
    });
  });

  test("a weapon is refused once its limit is spent this month", () => {
    expect.hasAssertions();

    const limited = { ...good, buyLimit: 1 };
    const first = buyPaimonsBargainsWeapon(wallet, EMPTY_INVENTORY, [], limited, getWeaponDefinition, NOW);

    expect(
      buyPaimonsBargainsWeapon(
        first?.wallet ?? wallet,
        first?.inventory ?? EMPTY_INVENTORY,
        first?.purchases ?? [],
        limited,
        getWeaponDefinition,
        NOW,
      ),
    ).toBeUndefined();
  });

  test("a weapon is refused when its price is unaffordable", () => {
    expect.hasAssertions();

    const poor = { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: WEAPON_PRICE - 1 };

    expect(buyPaimonsBargainsWeapon(poor, EMPTY_INVENTORY, [], good, getWeaponDefinition, NOW)).toBeUndefined();
  });
});
