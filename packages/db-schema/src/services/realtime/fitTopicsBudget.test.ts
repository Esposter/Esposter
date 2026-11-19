import type { ColumnTopic } from "#src/models/realtime/Topic";

import { schema } from "#src/generated/schema";
import { StorageBucket } from "#src/models/storage/StorageBucket";
import { fitTopicsBudget } from "#src/services/realtime/fitTopicsBudget";
import { getBlobTopic } from "#src/services/realtime/getBlobTopic";
import { getStorageBucketBindingName } from "#src/services/storage/getStorageBucketBindingName";
import { getTableName } from "drizzle-orm";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(fitTopicsBudget, () => {
  // A blob's key may hold an equals sign, which a row topic's value holds too, so a blob topic is told apart by its bucket and
  // Is never collapsed into a table of that name
  test("leaves a blob topic whole, though its key holds an equals sign", () => {
    expect.hasAssertions();

    const roomTable = getTableName(schema.roomsInMessage);
    const blobTopic = getBlobTopic(getStorageBucketBindingName(StorageBucket.UserAssets), "folder=one");

    expect(
      fitTopicsBudget(
        [{ topic: blobTopic }, { topic: `${roomTable}:id=${v7()}` }, { topic: `${roomTable}:id=${v7()}` }],
        1,
      ),
    ).toStrictEqual([{ topic: blobTopic }, { topic: `${roomTable}:*` }]);
  });

  // A table collapses a table at a time, the one holding the most row topics first, and stops once the count fits
  test("collapses the table holding the most row topics first, and stops once the count fits", () => {
    expect.hasAssertions();

    const roomTable = getTableName(schema.roomsInMessage);
    const memberTable = getTableName(schema.usersToRoomsInMessage);
    const roomIds = Array.from({ length: 3 }, () => v7());
    const memberRoomIds = Array.from({ length: 2 }, () => v7());

    expect(
      fitTopicsBudget(
        [
          ...roomIds.map((id): ColumnTopic => ({ topic: `${roomTable}:id=${id}` })),
          ...memberRoomIds.map((roomId): ColumnTopic => ({ topic: `${memberTable}:roomId=${roomId}` })),
        ],
        4,
      ).map(({ topic }) => topic),
    ).toStrictEqual([`${roomTable}:*`, ...memberRoomIds.map((roomId) => `${memberTable}:roomId=${roomId}`)].toSorted());
  });
});
