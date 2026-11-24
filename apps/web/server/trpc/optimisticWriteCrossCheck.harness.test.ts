import type { Entry } from "#src/models/shared/overlay/Entry";

import { createMockContext, getMockSession } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { getUncoveredWrites } from "#server/trpc/optimisticWriteCrossCheck.test";
import { blockRouter } from "#server/trpc/routers/block";
import { createFriendship } from "#server/trpc/routers/createFriendship.test";
import { blockTable, friendRequestTable, friendTable, pairTables } from "#src/services/message/user/pair/constants";
import { getBlockEntry } from "#src/services/message/user/pair/getBlockEntry";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";
import { describe, expect, test } from "vitest";

describe(getUncoveredWrites, () => {
  // The block writes the friendship, the request and the block row of the pair. This fixture entry shows the first two
  // And omits the block row, which the write names in its response, so the cross-check must report that row
  test("names the block row that a write changes and its entry omits", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { user, userId } = await createFriendship(context);
    const omitsBlockEntry: Entry = (view) => {
      const friendKey = getFriendRowKey(userId, user.id);
      view.get(friendTable, friendKey);
      view.get(friendRequestTable, friendKey);
    };
    const { uncovered } = await getUncoveredWrites({
      call: (callContext) => createCallerFactory(blockRouter)(callContext).createBlock(user.id),
      context,
      entry: omitsBlockEntry,
      path: "createBlock",
      tables: pairTables,
    });

    expect(uncovered.map(({ key, table }) => ({ key, table }))).toStrictEqual([
      { key: { blockedId: user.id, blockerId: userId }, table: blockTable.name },
    ]);
  });

  // The entry the block store issues shows every row the block writes, so the same write is covered
  test("names no row for a block entry that shows every row the block writes", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { user } = await createFriendship(context);
    const { named, uncovered } = await getUncoveredWrites({
      call: (callContext) => createCallerFactory(blockRouter)(callContext).createBlock(user.id),
      context,
      entry: getBlockEntry(getMockSession().user.id, user.id, new Date(0)),
      path: "createBlock",
      tables: pairTables,
    });

    expect(named).toHaveLength(2);
    expect(uncovered).toStrictEqual([]);
  });
});
