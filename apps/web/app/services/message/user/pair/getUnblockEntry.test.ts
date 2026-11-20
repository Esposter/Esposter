import type { SlotFor } from "#src/models/shared/overlay/SlotFor";

import { blockTable } from "#src/services/message/user/pair/constants";
import { getBlockRowKey } from "#src/services/message/user/pair/getBlockRowKey";
import { getUnblockEntry } from "#src/services/message/user/pair/getUnblockEntry";
import { createSlotFor } from "#src/services/shared/overlay/createSlotFor";
import { recordTouches } from "#src/services/shared/overlay/recordTouches";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getUnblockEntry, () => {
  test("touches the same distinct rows whether the pair's row and an unrelated row are held or not", () => {
    expect.hasAssertions();

    const userId = v7();
    const blockedId = v7();
    const otherId = v7();
    const entry = getUnblockEntry(userId, blockedId, new Date(0));
    const touchedKeys = (slotFor: SlotFor) => [
      ...new Set(recordTouches(slotFor, entry).map(({ key, table }) => JSON.stringify({ key, table }))),
    ];
    const emptySlotFor = createSlotFor();
    const heldSlotFor = createSlotFor();
    heldSlotFor(blockTable).arrive({
      blockedId,
      blockerId: userId,
      createdAt: new Date(0),
      deletedAt: null,
      updatedAt: new Date(0),
      version: 0,
    });
    heldSlotFor(blockTable).arrive({
      blockedId: otherId,
      blockerId: userId,
      createdAt: new Date(0),
      deletedAt: null,
      updatedAt: new Date(0),
      version: 0,
    });

    expect(touchedKeys(heldSlotFor)).toStrictEqual(touchedKeys(emptySlotFor));
    expect(touchedKeys(emptySlotFor)).toStrictEqual([
      JSON.stringify({ key: getBlockRowKey(userId, blockedId), table: blockTable.name }),
    ]);
  });
});
