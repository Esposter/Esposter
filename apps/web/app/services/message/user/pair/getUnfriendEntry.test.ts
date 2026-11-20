import type { SlotFor } from "#src/models/shared/overlay/SlotFor";

import { friendTable } from "#src/services/message/user/pair/constants";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";
import { getUnfriendEntry } from "#src/services/message/user/pair/getUnfriendEntry";
import { createSlotFor } from "#src/services/shared/overlay/createSlotFor";
import { recordTouches } from "#src/services/shared/overlay/recordTouches";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getUnfriendEntry, () => {
  test("touches the same distinct rows whether the pair's row and an unrelated row are held or not", () => {
    expect.hasAssertions();

    const userId = v7();
    const friendId = v7();
    const otherId = v7();
    const deletedAt = new Date(0);
    const entry = getUnfriendEntry(userId, friendId, deletedAt);
    const touchedKeys = (slotFor: SlotFor) => [
      ...new Set(recordTouches(slotFor, entry).map(({ key, table }) => JSON.stringify({ key, table }))),
    ];
    const emptySlotFor = createSlotFor();
    const heldSlotFor = createSlotFor();
    heldSlotFor(friendTable).arrive({
      createdAt: new Date(0),
      deletedAt: null,
      id: getFriendRowKey(userId, friendId)[0],
      receiverId: friendId,
      senderId: userId,
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
      JSON.stringify({ key: getFriendRowKey(userId, friendId), table: friendTable.name }),
    ]);
  });
});
