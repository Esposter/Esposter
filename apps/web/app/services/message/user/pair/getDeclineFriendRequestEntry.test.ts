import type { SlotFor } from "#src/models/shared/overlay/SlotFor";

import { friendRequestTable } from "#src/services/message/user/pair/constants";
import { getDeclineFriendRequestEntry } from "#src/services/message/user/pair/getDeclineFriendRequestEntry";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";
import { createSlotFor } from "#src/services/shared/overlay/createSlotFor";
import { recordTouches } from "#src/services/shared/overlay/recordTouches";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getDeclineFriendRequestEntry, () => {
  test("touches the same distinct rows whether the pair's row and an unrelated row are held or not", () => {
    expect.hasAssertions();

    const userId = v7();
    const senderId = v7();
    const otherId = v7();
    const entry = getDeclineFriendRequestEntry(userId, senderId, new Date(0));
    const touchedKeys = (slotFor: SlotFor) => [
      ...new Set(recordTouches(slotFor, entry).map(({ key, table }) => JSON.stringify({ key, table }))),
    ];
    const emptySlotFor = createSlotFor();
    const heldSlotFor = createSlotFor();
    heldSlotFor(friendRequestTable).arrive({
      createdAt: new Date(0),
      deletedAt: null,
      id: getFriendRowKey(userId, senderId)[0],
      receiverId: userId,
      senderId,
      updatedAt: new Date(0),
      version: 0,
    });
    heldSlotFor(friendRequestTable).arrive({
      createdAt: new Date(0),
      deletedAt: null,
      id: getFriendRowKey(userId, otherId)[0],
      receiverId: userId,
      senderId: otherId,
      updatedAt: new Date(0),
      version: 0,
    });

    expect(touchedKeys(heldSlotFor)).toStrictEqual(touchedKeys(emptySlotFor));
    expect(touchedKeys(emptySlotFor)).toStrictEqual([
      JSON.stringify({ key: getFriendRowKey(userId, senderId), table: friendRequestTable.name }),
    ]);
  });
});
