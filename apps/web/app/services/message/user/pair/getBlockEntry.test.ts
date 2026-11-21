import type { HeldTables } from "#src/models/shared/overlay/HeldTables";

import { blockTable, friendRequestTable, friendTable } from "#src/services/message/user/pair/constants";
import { getBlockEntry } from "#src/services/message/user/pair/getBlockEntry";
import { getBlockRowKey } from "#src/services/message/user/pair/getBlockRowKey";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";
import { getTouchedKeys } from "#src/services/message/user/pair/getTouchedKeys.test";
import { createSlotFor } from "#src/services/shared/overlay/createSlotFor";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getBlockEntry, () => {
  test("touches the same distinct rows whether the pair's rows and an unrelated row are held or not", () => {
    expect.hasAssertions();

    const userId = v7();
    const blockedId = v7();
    const otherId = v7();
    const now = new Date(0);
    const entry = getBlockEntry(userId, blockedId, now);
    const emptySlotFor = createSlotFor(shallowRef<HeldTables>({}));
    const heldSlotFor = createSlotFor(shallowRef<HeldTables>({}));
    const pairKey = getFriendRowKey(userId, blockedId)[0];
    heldSlotFor(friendTable).arrive({
      createdAt: new Date(0),
      deletedAt: null,
      id: pairKey,
      receiverId: blockedId,
      senderId: userId,
      updatedAt: new Date(0),
      version: 0,
    });
    heldSlotFor(friendRequestTable).arrive({
      createdAt: new Date(0),
      deletedAt: null,
      id: pairKey,
      receiverId: blockedId,
      senderId: userId,
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
      JSON.stringify({ key: getFriendRowKey(userId, blockedId), table: friendTable.name }),
      JSON.stringify({ key: getFriendRowKey(userId, blockedId), table: friendRequestTable.name }),
      JSON.stringify({ key: getBlockRowKey(userId, blockedId), table: blockTable.name }),
    ]);
  });
});
