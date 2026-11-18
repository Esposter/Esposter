import { topicSchema } from "#src/models/realtime/Topic";
import { StorageBucket } from "#src/models/storage/StorageBucket";
import { getStorageBucketBindingName } from "#src/services/storage/getStorageBucketBindingName";
import { describe, expect, test } from "vitest";

describe("topicSchema", () => {
  // A blob topic's bucket is a binding a storage bucket names, so a `x:y` naming no such binding is refused as a topic
  test("a blob topic's bucket must be a binding a storage bucket names, and any other name is refused", () => {
    expect.hasAssertions();

    expect(topicSchema.safeParse(`${getStorageBucketBindingName(StorageBucket.UserAssets)}:user/a`).success).toBe(true);
    expect(topicSchema.safeParse("NOT_A_BINDING:user/a").success).toBe(false);
  });
});
