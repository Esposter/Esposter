import type { Character } from "#src/models/character/Character";
import type { CharacterData } from "#src/models/character/CharacterData";
import type { PaimonsBargainsGood } from "#src/models/shop/PaimonsBargainsRotation";

import { BodyType } from "#src/models/character/BodyType";
import { Currency } from "#src/models/inventory/Currency";
import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { createCharacter } from "#src/services/character/createCharacter";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { buyPaimonsBargainsCharacter } from "#src/services/shop/buyPaimonsBargainsCharacter";
import { CONSTELLATION_COUNT } from "#src/services/wish/constants";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { describe, expect, test } from "vitest";

// A character's data as the tables hold it, with the rest of its fields left empty since a purchase reads only its weapon
const createCharacterData = (id: number): CharacterData => ({
  ascensionPhases: [],
  attributeLines: [],
  bodyType: BodyType.MediumFemale,
  growAttributes: [],
  id,
  initialWeaponId: id * 10,
  nameTextId: "a",
  rarity: 5,
  weaponType: WeaponType.Bow,
});

describe(buyPaimonsBargainsCharacter, () => {
  const CHARACTER_ID = 2;
  const CHARACTER_PRICE = 5;
  const STARGLITTER_ITEM_ID = 221;
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  // Forty days past the epoch, a morning in February, after the month's refresh on its first
  const NOW = EPOCH.add({ hours: 24 * 40 });
  const characterDataMap = new Map([[CHARACTER_ID, createCharacterData(CHARACTER_ID)]]);
  const good: PaimonsBargainsGood = {
    buyLimit: 1,
    goodsId: 102_005,
    itemCount: 1,
    itemId: CHARACTER_ID,
    priceCount: CHARACTER_PRICE,
    priceItemId: STARGLITTER_ITEM_ID,
    refresh: ShopRefresh.Monthly,
  };
  const wallet = { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: CHARACTER_PRICE * 2 };

  test("a character not held joins the roster at level one and its price is taken", () => {
    expect.hasAssertions();

    const result = buyPaimonsBargainsCharacter(wallet, [], [], good, characterDataMap, NOW);

    expect(result).toStrictEqual({
      characters: [createCharacter(CHARACTER_ID, characterDataMap)],
      purchases: [{ count: 1, goodsId: good.goodsId, lastPurchasedAt: NOW }],
      wallet: { ...wallet, [Currency.MasterlessStarglitter]: CHARACTER_PRICE },
    });
  });

  test("a character held below its sixth constellation gains a Stella Fortuna and is not added again", () => {
    expect.hasAssertions();

    const held: Character = { ...createCharacter(CHARACTER_ID, characterDataMap), constellationCount: 2 };
    const result = buyPaimonsBargainsCharacter(wallet, [held], [], good, characterDataMap, NOW);

    expect(result?.characters).toStrictEqual([{ ...held, stellaFortunaCount: 1 }]);
  });

  test("a character at its sixth constellation is refused", () => {
    expect.hasAssertions();

    const held: Character = {
      ...createCharacter(CHARACTER_ID, characterDataMap),
      constellationCount: CONSTELLATION_COUNT,
    };

    expect(buyPaimonsBargainsCharacter(wallet, [held], [], good, characterDataMap, NOW)).toBeUndefined();
  });

  test("a character is refused a second time in the same month", () => {
    expect.hasAssertions();

    const first = buyPaimonsBargainsCharacter(wallet, [], [], good, characterDataMap, NOW);

    expect(first).toBeDefined();
    expect(
      buyPaimonsBargainsCharacter(
        first?.wallet ?? wallet,
        first?.characters ?? [],
        first?.purchases ?? [],
        good,
        characterDataMap,
        NOW,
      ),
    ).toBeUndefined();
  });

  test("a character is refused when its price is unaffordable", () => {
    expect.hasAssertions();

    const poor = { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: CHARACTER_PRICE - 1 };

    expect(buyPaimonsBargainsCharacter(poor, [], [], good, characterDataMap, NOW)).toBeUndefined();
  });
});
