import { createMockBucket } from "@esposter/db-mock";
import { StorageBucket } from "@esposter/db-schema";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { deleteUserDirectories } from "#src/services/storage/deleteUserDirectories";
import { listBlobNames } from "#src/services/storage/listBlobNames";

describe(deleteUserDirectories, () => {
  const userId = crypto.randomUUID();
  let bucket: Awaited<ReturnType<typeof createMockBucket>>["bucket"];
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({ bucket, dispose } = await createMockBucket(StorageBucket.UserAssets));
  });

  afterAll(async () => {
    await dispose();
  });

  // The trailing slash is what keeps one user's directory from taking another whose id starts with the same characters
  test("removes only the user's own directory, not one whose id extends it", async () => {
    expect.hasAssertions();

    await bucket.put(`${userId}/ProfileImage`, "");
    await bucket.put(`${userId}2/ProfileImage`, "");

    await deleteUserDirectories([bucket], userId);

    await expect(listBlobNames(bucket, "")).resolves.toStrictEqual([`${userId}2/ProfileImage`]);
  });
});
