import type { BlockInSocial, FriendInSocial } from "@esposter/db-schema";

import { createTable } from "#src/services/shared/overlay/createTable";
import { blocksInSocial, friendsInSocial } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(createTable, () => {
  const friend: FriendInSocial = {
    createdAt: new Date(0),
    deletedAt: null,
    id: "id",
    receiverId: "receiverId",
    senderId: "senderId",
    updatedAt: new Date(0),
    version: 0,
  };
  const block: BlockInSocial = {
    blockedId: "blockedId",
    blockerId: "blockerId",
    createdAt: new Date(0),
    deletedAt: null,
    updatedAt: new Date(0),
    version: 0,
  };

  test("keys a row by its single primary-key column", () => {
    expect.hasAssertions();

    expect(createTable(friendsInSocial).keyOf(friend)).toStrictEqual([friend.id]);
  });

  // The declared order is blockerId then blockedId, which is not alphabetical, so a key read in name order fails here
  test("keys a row by its composite primary key, in the order the key lists its columns", () => {
    expect.hasAssertions();

    expect(createTable(blocksInSocial).keyOf(block)).toStrictEqual([block.blockerId, block.blockedId]);
  });
});
