import type { SlotFor } from "#src/models/shared/overlay/SlotFor";

import { friendRequestTable, friendTable } from "#src/services/message/user/pair/constants";
import { getAcceptFriendRequestEntry } from "#src/services/message/user/pair/getAcceptFriendRequestEntry";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";
import { createSlotFor } from "#src/services/shared/overlay/createSlotFor";
import { recordTouches } from "#src/services/shared/overlay/recordTouches";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getAcceptFriendRequestEntry, () => {
  test("touches the same distinct rows whether the pair's rows and an unrelated row are held or not", () => {
    expect.hasAssertions();

    const userId = v7();
    const senderId = v7();
    const otherId = v7();
    const entry = getAcceptFriendRequestEntry(userId, senderId, new Date(0));
    const touchedKeys = (slotFor: SlotFor) => [
      ...new Set(recordTouches(slotFor, entry).map(({ key, table }) => JSON.stringify({ key, table }))),
    ];
    const emptySlotFor = createSlotFor();
    const heldSlotFor = createSlotFor();
    const pairKey = getFriendRowKey(userId, senderId)[0];
    heldSlotFor(friendRequestTable).arrive({
      createdAt: new Date(0),
      deletedAt: null,
      id: pairKey,
      receiverId: userId,
      senderId,
      updatedAt: new Date(0),
      version: 0,
    });
    heldSlotFor(friendTable).arrive({
      createdAt: new Date(0),
      deletedAt: null,
      id: getFriendRowKey(userId, otherId)[0],
      receiverId: otherId,
      senderId: userId,
      updatedAt: new Date(0),
      version: 0,
    });

    expect(touchedKeys(heldSlotFor)).toStrictEqual(touchedKeys(emptySlotFor));
    expect(touchedKeys(emptySlotFor)).toStrictEqual([
      JSON.stringify({ key: getFriendRowKey(userId, senderId), table: friendRequestTable.name }),
      JSON.stringify({ key: getFriendRowKey(userId, senderId), table: friendTable.name }),
    ]);
  });
});
