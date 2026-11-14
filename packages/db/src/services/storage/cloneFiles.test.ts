import type { Database } from "@esposter/db-schema";

import { createUser } from "#src/services/message/createUser.test";
import { cloneFiles } from "#src/services/storage/cloneFiles";
import { getFileBlobNames } from "#src/services/storage/getFileBlobNames";
import { createMockBucket, createMockDb } from "@esposter/db-mock";
import { FileEntity, storageLedgerInStorage, StorageBucket, usersInAuth } from "@esposter/db-schema";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

describe(cloneFiles, () => {
  let db: Database;
  let bucket: Awaited<ReturnType<typeof createMockBucket>>["bucket"];
  let dispose: () => Promise<void>;
  const userId = crypto.randomUUID();
  const filename = "a";

  beforeAll(async () => {
    db = (await createMockDb()).db;
    await db.insert(usersInAuth).values(createUser(userId, new Date(0), "name"));
    ({ bucket, dispose } = await createMockBucket(StorageBucket.MessageAssets));
  });

  afterEach(async () => {
    await db.delete(storageLedgerInStorage);
    await db.update(usersInAuth).set({ storageBytesUsed: 0 });
  });

  afterAll(async () => {
    await db.delete(usersInAuth);
    await dispose();
  });

  test("copies the original and its sibling thumbnail, and reports the thumbnail as written", async () => {
    expect.hasAssertions();

    const sourcePrefix = crypto.randomUUID();
    const destinationPrefix = crypto.randomUUID();
    const id = crypto.randomUUID();
    const { blobName, thumbnailBlobName } = getFileBlobNames(sourcePrefix, id, filename);
    await bucket.put(blobName, "original");
    await bucket.put(thumbnailBlobName, "thumbnail");

    const [clonedFile] = await cloneFiles(
      db,
      userId,
      StorageBucket.MessageAssets,
      bucket,
      [new FileEntity({ filename, hasThumbnail: true, id })],
      sourcePrefix,
      destinationPrefix,
    );
    const clonedBlobNames = getFileBlobNames(destinationPrefix, clonedFile?.id ?? "", filename);

    expect(clonedFile?.hasThumbnail).toBe(true);
    expect(await (await bucket.get(clonedBlobNames.blobName))?.text()).toBe("original");
    expect(await (await bucket.get(clonedBlobNames.thumbnailBlobName))?.text()).toBe("thumbnail");
  });

  // A clone is all-or-nothing to its caller, so what landed before the failure is deleted and its charge given back
  test("clears what it wrote and releases its charges when a copy fails", async () => {
    expect.hasAssertions();

    const sourcePrefix = crypto.randomUUID();
    const destinationPrefix = crypto.randomUUID();
    const id = crypto.randomUUID();
    // The original is there and the thumbnail the entity claims is not
    await bucket.put(getFileBlobNames(sourcePrefix, id, filename).blobName, "original");

    await expect(
      cloneFiles(
        db,
        userId,
        StorageBucket.MessageAssets,
        bucket,
        [new FileEntity({ filename, hasThumbnail: true, id })],
        sourcePrefix,
        destinationPrefix,
      ),
    ).rejects.toThrow();

    const { objects } = await bucket.list({ prefix: destinationPrefix });
    expect(objects).toStrictEqual([]);
    await expect(db.query.storageLedgerInStorage.findMany()).resolves.toStrictEqual([]);
  });
});
