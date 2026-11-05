import type { DevCommand } from "#src/models/dev/DevCommand";

import { Currency } from "#src/models/inventory/Currency";
import { InventoryItemKind } from "#src/models/inventory/InventoryItemKind";
import { giveItem, giveItemArgs } from "#src/services/dev/commands/giveItem";
import { DEV_CRYSTAL_CORE_ID, DEV_CRYSTAL_CORE_NAME, DEV_ITEM_TABLES } from "#src/services/dev/constants.test";
import { runDevCommand } from "#src/services/dev/runDevCommand";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(giveItem, () => {
  const CRYSTAL_CORE_COUNT = 3;
  const DEFAULT_COUNT = 1;
  const MORA_COUNT = 2;
  const MORA_NAME = ENGLISH_GAME_TEXT[GameTextKey.Mora];
  const UNKNOWN_NAME = "Zzz";

  test("each writes the same save field the game's own act writes", () => {
    expect.hasAssertions();

    expect(giveItem(EMPTY_GENSHIN_SAVE, { count: MORA_COUNT, item: MORA_NAME }, DEV_ITEM_TABLES)).toStrictEqual({
      ok: true,
      save: {
        ...EMPTY_GENSHIN_SAVE,
        wallet: {
          ...EMPTY_GENSHIN_SAVE.wallet,
          currencies: { ...EMPTY_GENSHIN_SAVE.wallet.currencies, [Currency.Mora]: MORA_COUNT },
        },
      },
      value: MORA_COUNT,
    });
    expect(
      giveItem(EMPTY_GENSHIN_SAVE, { count: CRYSTAL_CORE_COUNT, item: DEV_CRYSTAL_CORE_NAME }, DEV_ITEM_TABLES),
    ).toStrictEqual({
      ok: true,
      save: {
        ...EMPTY_GENSHIN_SAVE,
        inventory: {
          items: [{ id: 0, itemId: DEV_CRYSTAL_CORE_ID, kind: InventoryItemKind.Stack, quantity: CRYSTAL_CORE_COUNT }],
          nextId: 1,
          quickSwapItemIds: [],
        },
      },
      value: CRYSTAL_CORE_COUNT,
    });
  });

  test("a name the game does not show answers its error and writes no save", () => {
    expect.hasAssertions();

    expect(giveItem(EMPTY_GENSHIN_SAVE, { count: 1, item: UNKNOWN_NAME }, DEV_ITEM_TABLES)).toStrictEqual({
      error: `unknown item ${UNKNOWN_NAME}`,
      ok: false,
    });
  });

  test("a line names the item first and the count after it, and the count is one when the line gives none", () => {
    expect.hasAssertions();

    const countCommand: DevCommand<typeof giveItemArgs> = {
      args: giveItemArgs,
      argumentNames: ["item", "count"],
      name: "give",
      run: ({ count, item }) => ({ ok: true, value: `${item} ${count}` }),
    };

    expect(runDevCommand(countCommand, [MORA_NAME, String(MORA_COUNT)])).toStrictEqual({
      ok: true,
      value: `${MORA_NAME} ${MORA_COUNT}`,
    });
    expect(runDevCommand(countCommand, [MORA_NAME])).toStrictEqual({
      ok: true,
      value: `${MORA_NAME} ${DEFAULT_COUNT}`,
    });
  });
});
