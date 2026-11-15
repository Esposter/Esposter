import type { Context } from "#server/trpc/context";

import { generateReservedMessageFilePresignedUrlEntities } from "#server/services/message/file/generateReservedMessageFilePresignedUrlEntities";
import { createMockContext, createMockUser } from "#server/trpc/context.test";
import { MimeType } from "#shared/models/file/MimeType";
import {
  MAX_THUMBNAIL_BYTES,
  StorageBucket,
  storageLedgerInStorage,
  StorageTier,
  StorageTierQuotaMap,
  usersInAuth,
} from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// Signed with fixed credentials, so the write targets are real presigned urls and nothing reads the account's environment
vi.mock(import("#server/services/storage/getStorageCredentials"), () => ({
  getStorageCredentials: () => ({
    accessKeyId: "accessKeyId",
    accountId: "accountId",
    environment: "dev",
    secretAccessKey: "secretAccessKey",
  }),
}));

describe(generateReservedMessageFilePresignedUrlEntities, () => {
  let mockContext: Context;
  let userId: string;
  const roomId = v7();
  const filename = "filename";
  const size = 1;
  const image = { filename, mimetype: MimeType.Png, size };
  const readLedgerEntries = () => mockContext.db.query.storageLedgerInStorage.findMany();

  beforeAll(async () => {
    mockContext = await createMockContext();
    userId = (await createMockUser(mockContext.db)).id;
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await mockContext.db.delete(storageLedgerInStorage);
    await mockContext.db.update(usersInAuth).set({ storageBytesUsed: 0, storageTier: StorageTier.Free });
  });

  test("attachment uploaded within the allowance reserves its original and thumbnail under the uploader", async () => {
    expect.hasAssertions();

    const [presignedUrlEntity] = await generateReservedMessageFilePresignedUrlEntities(mockContext.db, userId, roomId, [
      image,
    ]);
    const ledgerEntries = await readLedgerEntries();

    expect(presignedUrlEntity?.thumbnailPresignedUrl).toBeDefined();
    expect(ledgerEntries).toHaveLength(2);
    expect(
      ledgerEntries.map(({ declaredBytes }) => declaredBytes).toSorted((left, right) => left - right),
    ).toStrictEqual([size, MAX_THUMBNAIL_BYTES].toSorted((left, right) => left - right));
    expect(ledgerEntries.every((entry) => entry.userId === userId)).toBe(true);
    expect(ledgerEntries.every((entry) => entry.containerName === StorageBucket.MessageAssets)).toBe(true);
  });

  test("reserves only the original of a file that has no thumbnail", async () => {
    expect.hasAssertions();

    const [presignedUrlEntity] = await generateReservedMessageFilePresignedUrlEntities(mockContext.db, userId, roomId, [
      { filename, mimetype: MimeType.Pdf, size },
    ]);
    const ledgerEntries = await readLedgerEntries();

    expect(presignedUrlEntity?.thumbnailPresignedUrl).toBeUndefined();
    expect(ledgerEntries.map(({ declaredBytes }) => declaredBytes)).toStrictEqual([size]);
  });

  // The quota is what a refused reserve is for: no write target may exist for bytes the ledger does not hold
  test("attachment refused over the allowance returns no write target", async () => {
    expect.hasAssertions();

    await mockContext.db
      .update(usersInAuth)
      .set({ storageBytesUsed: StorageTierQuotaMap[StorageTier.Free] })
      .where(eq(usersInAuth.id, userId));

    await expect(
      generateReservedMessageFilePresignedUrlEntities(mockContext.db, userId, roomId, [image]),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: You have run out of storage.]`);

    await expect(readLedgerEntries()).resolves.toStrictEqual([]);
  });
});
