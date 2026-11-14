import type { Database } from "@esposter/db-schema";

import { createUser } from "#src/services/message/createUser.test";
import { listChargedBlobsByUser } from "#src/services/storage/listChargedBlobsByUser";
import { createMockDb } from "@esposter/db-mock";
import { StorageBucket, storageLedgerInStorage, usersInAuth } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

describe(listChargedBlobsByUser, () => {
  let db: Database;
  const userId = v7();
  const otherUserId = v7();
  const resourceId = v7();
  const otherResourceId = v7();
  const roomId = v7();
  const fileId = v7();
  // A ledger row is what a charge leaves behind, so the rows are written as the counter writes them and the sweep
  // Reads them back by owner — no blob listing is involved
  const createLedgerEntry = (ownerId: string, containerName: StorageBucket, blobName: string) =>
    db
      .insert(storageLedgerInStorage)
      .values({ blobName, containerName, countedBytes: 0, declaredBytes: 1, expiresAt: new Date(0), userId: ownerId });

  beforeAll(async () => {
    db = (await createMockDb()).db;
    await db
      .insert(usersInAuth)
      .values([createUser(userId, new Date(0), "name"), createUser(otherUserId, new Date(0), "name")]);
  });

  afterEach(async () => {
    await db.delete(storageLedgerInStorage);
  });

  afterAll(async () => {
    await db.delete(usersInAuth);
  });

  test("returns the user's charged blobs grouped by container, and no other user's", async () => {
    expect.hasAssertions();

    await createLedgerEntry(userId, StorageBucket.ResourceAssets, `${resourceId}/blobName`);
    await createLedgerEntry(userId, StorageBucket.MessageAssets, `${roomId}/${fileId}`);
    await createLedgerEntry(otherUserId, StorageBucket.ResourceAssets, `${otherResourceId}/blobName`);

    await expect(listChargedBlobsByUser(db, userId)).resolves.toStrictEqual(
      new Map([
        [StorageBucket.MessageAssets, [`${roomId}/${fileId}`]],
        [StorageBucket.ResourceAssets, [`${resourceId}/blobName`]],
      ]),
    );
  });
});
