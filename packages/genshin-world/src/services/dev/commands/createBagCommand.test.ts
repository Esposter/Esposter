import { Currency } from "#src/models/inventory/Currency";
import { createBagCommand } from "#src/services/dev/commands/createBagCommand";
import { DEV_CRYSTAL_CORE_ID, DEV_CRYSTAL_CORE_NAME, DEV_ITEM_TABLES } from "#src/services/dev/constants.test";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(createBagCommand, () => {
  const CRYSTAL_CORE_COUNT = 3;
  const MORA_COUNT = 2;
  const MORA_NAME = ENGLISH_GAME_TEXT[GameTextKey.Mora];

  test("A bag read counts an item across the bag and the wallet", () => {
    expect.hasAssertions();

    const command = createBagCommand({
      getInventory: () => ({
        ...EMPTY_INVENTORY,
        items: [
          {
            definition: { id: DEV_CRYSTAL_CORE_ID, name: DEV_CRYSTAL_CORE_NAME, rank: 0, rarity: 1, stackLimit: 99 },
            id: 0,
            quantity: CRYSTAL_CORE_COUNT,
          },
        ],
      }),
      getWallet: () => ({ ...EMPTY_WALLET, [Currency.Mora]: MORA_COUNT }),
      itemTables: DEV_ITEM_TABLES,
    });

    expect({
      crystalCore: command.run({ item: DEV_CRYSTAL_CORE_NAME }),
      mora: command.run({ item: MORA_NAME }),
    }).toStrictEqual({ crystalCore: { ok: true, value: CRYSTAL_CORE_COUNT }, mora: { ok: true, value: MORA_COUNT } });
  });
});
