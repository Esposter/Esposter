import { friendRequestTable } from "#src/services/message/user/pair/constants";
import { getDeclineFriendRequestEntry } from "#src/services/message/user/pair/getDeclineFriendRequestEntry";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";
import { getTouchedKeys } from "#src/services/message/user/pair/getTouchedKeys.test";
import { createSlotFor } from "#src/services/shared/overlay/createSlotFor";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getDeclineFriendRequestEntry, () => {
  test("touches the same distinct rows whether the pair's row and an unrelated row are held or not", () => {
    expect.hasAssertions();

    const userId = v7();
    const senderId = v7();
    const otherId = v7();
    const entry = getDeclineFriendRequestEntry(userId, senderId, new Date(0));
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

    expect(getTouchedKeys(heldSlotFor, entry)).toStrictEqual(getTouchedKeys(emptySlotFor, entry));
    expect(getTouchedKeys(emptySlotFor, entry)).toStrictEqual([
      JSON.stringify({ key: getFriendRowKey(userId, senderId), table: friendRequestTable.name }),
    ]);
  });
});
