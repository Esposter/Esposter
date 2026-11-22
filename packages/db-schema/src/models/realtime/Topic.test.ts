import { topicSchema } from "#src/models/realtime/Topic";
import { StorageBucket } from "#src/models/storage/StorageBucket";
import { getStorageBucketBindingName } from "#src/services/storage/getStorageBucketBindingName";
import { describe, expect, test } from "vitest";

describe("topicSchema", () => {
  // A blob topic's bucket is a binding a storage bucket names, so a `x:y` naming no such binding is refused as a topic
  test("a blob topic's bucket must be a binding a storage bucket names, and any other name is refused", () => {
    expect.hasAssertions();

    expect(topicSchema.safeParse(`${getStorageBucketBindingName(StorageBucket.UserAssets)}: `).success).toBe(true);
    expect(topicSchema.safeParse("NOT_A_BINDING: ").success).toBe(false);
  });

  // A column is metadata of a watch and a publish, so a table's topic names its rows and never one of its columns
  test("a scope topic names a table's rows, and a column is not part of its name", () => {
    expect.hasAssertions();

    expect(topicSchema.safeParse("message_usersToRooms:*").success).toBe(true);
    expect(topicSchema.safeParse("message_usersToRooms:roomId= ").success).toBe(true);
    expect(topicSchema.safeParse("message_usersToRooms.isHidden:*").success).toBe(false);
  });
});
