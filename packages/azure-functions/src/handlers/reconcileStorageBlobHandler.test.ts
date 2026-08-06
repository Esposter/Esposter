import type { EventGridEvent } from "@azure/functions";
import type { BlobCreatedEventGridData, relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { reconcileStorageBlobHandler } from "@/handlers/reconcileStorageBlobHandler";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { AzureContainer, getBlobSubjectPrefix, storageBlobs, users } from "@esposter/db-schema";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: PostgresJsDatabase<typeof relations>;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

describe(reconcileStorageBlobHandler, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const userId = crypto.randomUUID();
  const containerName = AzureContainer.MessageAssets;
  const blobName = `roomId/id|file name.png`;
  const contentLength = 4;
  const createEventGridEvent = (subject: string): EventGridEvent => ({
    data: { contentLength } satisfies BlobCreatedEventGridData,
    dataVersion: "1.0",
    eventTime: "1970-01-01T00:00:00.000Z",
    eventType: "Microsoft.Storage.BlobCreated",
    id: crypto.randomUUID(),
    metadataVersion: "1",
    subject,
    topic: "",
  });
  const readStorageBytesUsed = async () =>
    (await mockDb.query.users.findFirst({ columns: { storageBytesUsed: true }, where: { id: { eq: userId } } }))
      ?.storageBytesUsed;

  beforeAll(async () => {
    mockDb = await createMockDb();
    const createdAt = new Date();
    await mockDb.insert(users).values({
      createdAt,
      email: userId,
      emailVerified: true,
      id: userId,
      image: "",
      name: "name",
      updatedAt: createdAt,
    });
  });

  afterEach(async () => {
    await mockDb.delete(storageBlobs);
    await mockDb.update(users).set({ storageBytesUsed: 0 });
  });

  const createStorageBlob = () =>
    mockDb.insert(storageBlobs).values({
      blobName,
      containerName,
      countedBytes: 0,
      declaredBytes: 1,
      expiresAt: new Date(),
      userId,
    });

  test("charges the owner what storage reported", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await reconcileStorageBlobHandler(
      createEventGridEvent(`${getBlobSubjectPrefix(containerName)}${blobName}`),
      context,
    );

    await expect(readStorageBytesUsed()).resolves.toBe(contentLength);
  });

  test("recovers a blob name storage percent-encoded into the subject", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await reconcileStorageBlobHandler(
      createEventGridEvent(`${getBlobSubjectPrefix(containerName)}${encodeURIComponent(blobName)}`),
      context,
    );

    await expect(readStorageBytesUsed()).resolves.toBe(contentLength);
  });

  // A lone `%` is legal in a filename and decodes to nothing valid. The blob is simply one nobody reserved —
  // A clone or an upload from outside the chokepoints — so it is a no-op, never an event that poisons its queue
  test("ignores an unreserved blob whose name cannot be decoded", async () => {
    expect.hasAssertions();

    await expect(
      reconcileStorageBlobHandler(
        createEventGridEvent(`${getBlobSubjectPrefix(containerName)}roomId/id|50%off.png`),
        context,
      ),
    ).resolves.toBeUndefined();
    await expect(readStorageBytesUsed()).resolves.toBe(0);
  });

  test("ignores a container no upload reserves against", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await reconcileStorageBlobHandler(
      createEventGridEvent(`${getBlobSubjectPrefix(AzureContainer.PublicUserAssets)}${blobName}`),
      context,
    );

    await expect(readStorageBytesUsed()).resolves.toBe(0);
  });
});
