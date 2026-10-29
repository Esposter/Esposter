import type { DevCommand } from "#src/models/dev/DevCommand";

import { Currency } from "#src/models/inventory/Currency";
import { InventoryItemKind } from "#src/models/inventory/InventoryItemKind";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { giveItem, giveItemArgs } from "#src/services/dev/commands/giveItem";
import { runDevCommand } from "#src/services/dev/runDevCommand";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(giveItem, () => {
  const CRYSTAL_CORE_ID = 1;
  const CRYSTAL_CORE_NAME = "Crystal Core";
  const CRYSTAL_CORE_NAME_TEXT_ID = "1";
  const CRYSTAL_CORE_COUNT = 3;
  const DEFAULT_COUNT = 1;
  const MORA_COUNT = 2;
  const MORA_NAME = ENGLISH_GAME_TEXT[GameTextKey.Mora];
  const UNKNOWN_NAME = "Zzz";
  const tables: Parameters<typeof giveItem>[2] = {
    gameText: ENGLISH_GAME_TEXT,
    materialDataMap: new Map([
      [
        CRYSTAL_CORE_ID,
        {
          id: CRYSTAL_CORE_ID,
          materialType: MaterialType.Consume,
          nameTextId: CRYSTAL_CORE_NAME_TEXT_ID,
          rank: 0,
          rarity: 1,
          stackLimit: 99,
        },
      ],
    ]),
    nameText: { [CRYSTAL_CORE_NAME_TEXT_ID]: CRYSTAL_CORE_NAME },
    reliquaryPieceEntryMap: new Map(),
    weaponDataMap: new Map(),
  };

  test("each writes the same save field the game's own act writes", () => {
    expect.hasAssertions();

    expect(giveItem(EMPTY_GENSHIN_SAVE, { count: MORA_COUNT, item: MORA_NAME }, tables)).toStrictEqual({
      ok: true,
      save: expect.objectContaining({
        inventory: EMPTY_GENSHIN_SAVE.inventory,
        wallet: expect.objectContaining({ currencies: expect.objectContaining({ [Currency.Mora]: MORA_COUNT }) }),
      }),
      value: MORA_COUNT,
    });
    expect(giveItem(EMPTY_GENSHIN_SAVE, { count: CRYSTAL_CORE_COUNT, item: CRYSTAL_CORE_NAME }, tables)).toStrictEqual({
      ok: true,
      save: expect.objectContaining({
        inventory: {
          items: [{ id: 0, itemId: CRYSTAL_CORE_ID, kind: InventoryItemKind.Stack, quantity: CRYSTAL_CORE_COUNT }],
          nextId: 1,
          quickSwapItemIds: [],
        },
      }),
      value: CRYSTAL_CORE_COUNT,
    });
  });

  test("a name the game does not show answers its error and writes no save", () => {
    expect.hasAssertions();

    expect(giveItem(EMPTY_GENSHIN_SAVE, { count: 1, item: UNKNOWN_NAME }, tables)).toStrictEqual({
      error: `unknown item ${UNKNOWN_NAME}`,
      ok: false,
    });
  });

  test("a line names the item first and the count after it, and the count is one when the line gives none", () => {
    expect.hasAssertions();

    const countCommand: DevCommand<typeof giveItemArgs> = {
      args: giveItemArgs,
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
