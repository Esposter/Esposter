import { blockTable } from "#src/services/message/user/pair/constants";
import { getBlockRowKey } from "#src/services/message/user/pair/getBlockRowKey";
import { getTouchedKeys } from "#src/services/message/user/pair/getTouchedKeys.test";
import { getUnblockEntry } from "#src/services/message/user/pair/getUnblockEntry";
import { createSlotFor } from "#src/services/shared/overlay/createSlotFor";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getUnblockEntry, () => {
  test("touches the same distinct rows whether the pair's row and an unrelated row are held or not", () => {
    expect.hasAssertions();

    const userId = v7();
    const blockedId = v7();
    const otherId = v7();
    const entry = getUnblockEntry(userId, blockedId, new Date(0));
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

    expect(getTouchedKeys(heldSlotFor, entry)).toStrictEqual(getTouchedKeys(emptySlotFor, entry));
    expect(getTouchedKeys(emptySlotFor, entry)).toStrictEqual([
      JSON.stringify({ key: getBlockRowKey(userId, blockedId), table: blockTable.name }),
    ]);
  });
});
