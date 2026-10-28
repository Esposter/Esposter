import type { Database } from "@esposter/db-schema";

import { createUser } from "#src/services/message/createUser.test";
import { listChargedBlobsByUser } from "#src/services/storage/listChargedBlobsByUser";
import { createMockDb } from "@esposter/db-mock";
import { AzureContainer, storageLedgerInStorage, usersInAuth } from "@esposter/db-schema";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

describe(listChargedBlobsByUser, () => {
  let db: Database;
  const userId = crypto.randomUUID();
  const otherUserId = crypto.randomUUID();
  const resourceId = crypto.randomUUID();
  const otherResourceId = crypto.randomUUID();
  const roomId = crypto.randomUUID();
  const fileId = crypto.randomUUID();
  // A ledger row is what a charge leaves behind, so the rows are written as the counter writes them and the sweep
  // Reads them back by owner — no blob listing is involved
  const createLedgerEntry = (ownerId: string, containerName: AzureContainer, blobName: string) =>
    db
      .insert(storageLedgerInStorage)
      .values({ blobName, containerName, countedBytes: 0, declaredBytes: 1, expiresAt: new Date(0), userId: ownerId });

  beforeAll(async () => {
    db = await createMockDb();
    await db
      .insert(usersInAuth)
      .values([createUser(userId, new Date(0), "name"), createUser(otherUserId, new Date(0), "otherName")]);
  });

  afterEach(async () => {
    await db.delete(storageLedgerInStorage);
  });

  afterAll(async () => {
    await db.delete(usersInAuth);
  });

  test("returns the user's charged blobs grouped by container, and no other user's", async () => {
    expect.hasAssertions();

    await createLedgerEntry(userId, AzureContainer.ResourceAssets, `${resourceId}/blobName`);
    await createLedgerEntry(userId, AzureContainer.MessageAssets, `${roomId}/${fileId}`);
    await createLedgerEntry(otherUserId, AzureContainer.ResourceAssets, `${otherResourceId}/blobName`);

    await expect(listChargedBlobsByUser(db, userId)).resolves.toStrictEqual(
      new Map([
        [AzureContainer.MessageAssets, [`${roomId}/${fileId}`]],
        [AzureContainer.ResourceAssets, [`${resourceId}/blobName`]],
      ]),
    );
  });
});
