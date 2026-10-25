import type { Context } from "#server/trpc/context";

import { generateReservedMessageFileSasEntities } from "#server/services/message/file/generateReservedMessageFileSasEntities";
import { createMockContext, mockSessionOnce } from "#server/trpc/context.test";
import { MimeType } from "#shared/models/file/MimeType";
import { StorageTierQuotaMap } from "#shared/services/storage/StorageTierQuotaMap";
import {
  AzureContainer,
  MAX_THUMBNAIL_BYTES,
  storageLedgerInStorage,
  StorageTier,
  usersInAuth,
} from "@esposter/db-schema";
import { MockBlobClient } from "azure-mock";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

describe(generateReservedMessageFileSasEntities, () => {
  let mockContext: Context;
  let userId: string;
  const roomId = crypto.randomUUID();
  const filename = "filename";
  const size = 1;
  const image = { filename, mimetype: MimeType.Png, size };
  const readLedgerEntries = () => mockContext.db.query.storageLedgerInStorage.findMany();

  beforeAll(async () => {
    mockContext = await createMockContext();
    ({
      user: { id: userId },
    } = await mockSessionOnce(mockContext.db));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await mockContext.db.delete(storageLedgerInStorage);
    await mockContext.db.update(usersInAuth).set({ storageBytesUsed: 0, storageTier: StorageTier.Free });
  });

  test("attachment uploaded within the allowance reserves its original and thumbnail under the uploader", async () => {
    expect.hasAssertions();

    const [sasEntity] = await generateReservedMessageFileSasEntities(mockContext.db, userId, roomId, [image]);
    const ledgerEntries = await readLedgerEntries();

    expect(sasEntity?.thumbnailSasUrl).toBeDefined();
    expect(ledgerEntries).toHaveLength(2);
    expect(
      ledgerEntries.map(({ declaredBytes }) => declaredBytes).toSorted((left, right) => left - right),
    ).toStrictEqual([size, MAX_THUMBNAIL_BYTES].toSorted((left, right) => left - right));
    expect(ledgerEntries.every((entry) => entry.userId === userId)).toBe(true);
    expect(ledgerEntries.every((entry) => entry.containerName === AzureContainer.MessageAssets)).toBe(true);
  });

  test("reserves only the original of a file that has no thumbnail", async () => {
    expect.hasAssertions();

    const [sasEntity] = await generateReservedMessageFileSasEntities(mockContext.db, userId, roomId, [
      { filename, mimetype: MimeType.Pdf, size },
    ]);
    const ledgerEntries = await readLedgerEntries();

    expect(sasEntity?.thumbnailSasUrl).toBeUndefined();
    expect(ledgerEntries.map(({ declaredBytes }) => declaredBytes)).toStrictEqual([size]);
  });

  // The quota is what a refused reserve is for: no write target may exist for bytes the ledger does not hold
  test("attachment refused over the allowance returns no write target", async () => {
    expect.hasAssertions();

    await mockContext.db
      .update(usersInAuth)
      .set({ storageBytesUsed: StorageTierQuotaMap[StorageTier.Free] })
      .where(eq(usersInAuth.id, userId));
    const generateSasUrlSpy = vi.spyOn(MockBlobClient.prototype, "generateSasUrl");

    await expect(
      generateReservedMessageFileSasEntities(mockContext.db, userId, roomId, [image]),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: You have run out of storage.]`);

    expect(generateSasUrlSpy).not.toHaveBeenCalled();
    await expect(readLedgerEntries()).resolves.toStrictEqual([]);
  });
});
