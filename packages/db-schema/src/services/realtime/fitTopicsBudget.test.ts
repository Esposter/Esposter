import type { ColumnTopic } from "#src/models/realtime/Topic";

import { schema } from "#src/generated/schema";
import { StorageBucket } from "#src/models/storage/StorageBucket";
import { messagesInRoom } from "#src/objects/room/schema";
import { MAX_READ_TOPICS } from "#src/services/realtime/constants";
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

  // A blob collapses to its bucket's root, the empty key every write to the bucket publishes, so a read past the budget is still
  // Woken by a write to a key it did not name
  test("collapses a bucket's blob keys to the bucket's root topic, which every write to the bucket publishes", () => {
    expect.hasAssertions();

    const bindingName = getStorageBucketBindingName(StorageBucket.UserAssets);

    expect(
      fitTopicsBudget(
        Array.from({ length: 3 }, (): ColumnTopic => ({ topic: getBlobTopic(bindingName, v7()) })),
        1,
      ),
    ).toStrictEqual([{ topic: getBlobTopic(bindingName, "") }]);
  });

  // An object's rows name the object's scope and its table, so they collapse to that table's table-wide topic, which every write
  // The object makes to the table publishes. The scope alone is published by no write, so a collapse to it would never wake
  test("collapses an object's rows to its table's table-wide topic, not to the object's scope", () => {
    expect.hasAssertions();

    const tableTopic = `room/${v7()}:${getTableName(messagesInRoom)}`;

    expect(
      fitTopicsBudget(
        Array.from({ length: 3 }, (): ColumnTopic => ({ topic: `${tableTopic}:id=${v7()}` })),
        1,
      ),
    ).toStrictEqual([{ topic: `${tableTopic}:*` }]);
  });

  // Once each object's rows have collapsed to its table-wide topic, those topics are still one per object. Past the budget they
  // Collapse to the kind's table topic, which every object's write publishes beside its own, so a read over many objects fits
  test("collapses the table-wide topics of many objects of one kind to the kind's table topic", () => {
    expect.hasAssertions();

    const tableName = getTableName(messagesInRoom);
    const objectTopics = Array.from({ length: MAX_READ_TOPICS + 1 }, (): ColumnTopic => ({
      topic: `room/${v7()}:${tableName}:*`,
    }));

    expect(fitTopicsBudget(objectTopics, MAX_READ_TOPICS)).toStrictEqual([{ topic: `room/*:${tableName}:*` }]);
  });
});
