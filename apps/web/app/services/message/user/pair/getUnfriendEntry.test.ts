import { friendTable } from "#src/services/message/user/pair/constants";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";
import { getTouchedKeys } from "#src/services/message/user/pair/getTouchedKeys.test";
import { getUnfriendEntry } from "#src/services/message/user/pair/getUnfriendEntry";
import { createSlotFor } from "#src/services/shared/overlay/createSlotFor";
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

    expect(getTouchedKeys(heldSlotFor, entry)).toStrictEqual(getTouchedKeys(emptySlotFor, entry));
    expect(getTouchedKeys(emptySlotFor, entry)).toStrictEqual([
      JSON.stringify({ key: getFriendRowKey(userId, friendId), table: friendTable.name }),
    ]);
  });
});
