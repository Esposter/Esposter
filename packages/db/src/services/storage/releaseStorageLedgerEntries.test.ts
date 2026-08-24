import type { Database } from "@esposter/db-schema";

import { chargeStorageLedgerEntry } from "#src/services/storage/chargeStorageLedgerEntry";
import { reconcileStorageLedgerEntry } from "#src/services/storage/reconcileStorageLedgerEntry";
import { releaseStorageLedgerEntries } from "#src/services/storage/releaseStorageLedgerEntries";
import { releaseStorageLedgerEntriesByPrefix } from "#src/services/storage/releaseStorageLedgerEntriesByPrefix";
import { createMockDb } from "@esposter/db-mock";
import { AzureContainer, storageLedger, users } from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The counter carries stored bytes and nothing else, so every case here is about which of the two signals —
// Storage saying a blob landed, or a deletion saying it is gone — moved it, and by how much.
describe("storage blob ledger", () => {
  let db: Database;
  const userId = crypto.randomUUID();
  const containerName = AzureContainer.ResourceAssets;
  const resourceId = crypto.randomUUID();
  const blobName = `${resourceId}/files/blobName`;
  const declaredBytes = 10;
  const actualBytes = 4;
  const overwrittenBytes = 7;
  // Storage's per-blob ordering values, as they would arrive: the earlier write's event carries the lower one
  const sequencer = "0000000000000abc000000000000000000001";
  const laterSequencer = "0000000000000abc000000000000000000002";
  const readStorageBytesUsed = async () =>
    (await db.query.users.findFirst({ columns: { storageBytesUsed: true }, where: { id: { eq: userId } } }))
      ?.storageBytesUsed;
  // A hold as the reserve writes it: the space is claimed through declaredBytes, but nothing is counted
  // Against the user until storage reports what landed
  const createStorageLedgerEntry = () =>
    db.insert(storageLedger).values({
      blobName,
      containerName,
      countedBytes: 0,
      declaredBytes,
      expiresAt: new Date(),
      userId,
    });

  beforeAll(async () => {
    db = await createMockDb();
    const createdAt = new Date();
    await db.insert(users).values({
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
    await db.delete(storageLedger);
    await db.update(users).set({ storageBytesUsed: 0 });
  });

  test("counts the size storage reports, not the size the client declared", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();

    await expect(reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes)).resolves.toBe(true);
    await expect(readStorageBytesUsed()).resolves.toBe(actualBytes);

    const [reconciledStorageLedgerEntry] = await db.query.storageLedger.findMany();

    expect(reconciledStorageLedgerEntry).toMatchObject({ countedBytes: actualBytes, declaredBytes });
    expect(reconciledStorageLedgerEntry?.reconciledAt).not.toBeNull();
  });

  test("computes a zero delta for a redelivered event", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes);
    await reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes);

    await expect(readStorageBytesUsed()).resolves.toBe(actualBytes);
  });

  test("corrects the counter when the same write target is uploaded again", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes);
    // The SAS outlives one PUT, so a second upload replaces the blob — the counter must follow it rather
    // Than keep charging for the size the first one had
    await reconcileStorageLedgerEntry(db, containerName, blobName, overwrittenBytes);

    await expect(readStorageBytesUsed()).resolves.toBe(overwrittenBytes);
  });

  // Event Grid delivers at-least-once and in no order at all, so the later write's event can land first. The
  // Handler being idempotent does not cover this: replaying the earlier event is a well-behaved no-op that
  // Still leaves the counter holding a size the blob stopped having
  test("keeps the newest size when events for one blob arrive in reverse order", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntry(db, containerName, blobName, overwrittenBytes, laterSequencer);
    // The earlier write's event, delayed past the one that superseded it
    await expect(reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes, sequencer)).resolves.toBe(true);

    await expect(readStorageBytesUsed()).resolves.toBe(overwrittenBytes);

    const [storageLedgerEntry] = await db.query.storageLedger.findMany();

    expect(storageLedgerEntry).toMatchObject({ countedBytes: overwrittenBytes, sequencer: laterSequencer });
  });

  test("applies both sizes in turn when the same events arrive in order", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes, sequencer);

    await expect(readStorageBytesUsed()).resolves.toBe(actualBytes);

    await reconcileStorageLedgerEntry(db, containerName, blobName, overwrittenBytes, laterSequencer);

    await expect(readStorageBytesUsed()).resolves.toBe(overwrittenBytes);
  });

  // A charge is a guess about a write storage has already measured, so once an event has spoken for the blob
  // The charge yields to it. Otherwise a save whose charge is delayed past a newer save's event would put its
  // Own size back on the counter, and its own event — being older — would then be correctly rejected, leaving
  // The superseded size there for good
  test("ignores a charge that lands after an event has settled the blob", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntry(db, containerName, blobName, overwrittenBytes, laterSequencer);
    await chargeStorageLedgerEntry(db, userId, containerName, blobName, declaredBytes);
    await reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes, sequencer);

    await expect(readStorageBytesUsed()).resolves.toBe(overwrittenBytes);

    const [storageLedgerEntry] = await db.query.storageLedger.findMany();

    expect(storageLedgerEntry).toMatchObject({ countedBytes: overwrittenBytes, sequencer: laterSequencer });
  });

  // The server's own writes — a resource's content blob — have no reserve to ledger them, so the charge is
  // What both counts them and makes them releasable by the paths that already exist
  test("counts a blob the server wrote for itself", async () => {
    expect.hasAssertions();

    await chargeStorageLedgerEntry(db, userId, containerName, blobName, actualBytes);

    await expect(readStorageBytesUsed()).resolves.toBe(actualBytes);
    await expect(db.query.storageLedger.findMany()).resolves.toMatchObject([
      { countedBytes: actualBytes, declaredBytes: 0 },
    ]);
  });

  test("corrects rather than adds when the server rewrites the same blob", async () => {
    expect.hasAssertions();

    await chargeStorageLedgerEntry(db, userId, containerName, blobName, actualBytes);
    // Every save rewrites one blob name, so a second charge that summed would grow the counter without bound
    await chargeStorageLedgerEntry(db, userId, containerName, blobName, overwrittenBytes);

    await expect(readStorageBytesUsed()).resolves.toBe(overwrittenBytes);
  });

  test("gives a server-written blob back with the directory it sits in", async () => {
    expect.hasAssertions();

    await chargeStorageLedgerEntry(db, userId, containerName, blobName, actualBytes);
    await releaseStorageLedgerEntriesByPrefix(db, containerName, `${resourceId}/`);

    await expect(readStorageBytesUsed()).resolves.toBe(0);
    await expect(db.query.storageLedger.findMany()).resolves.toStrictEqual([]);
  });

  test("accounts a blob nothing reserved to nobody", async () => {
    expect.hasAssertions();

    await expect(reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes)).resolves.toBe(false);
    await expect(readStorageBytesUsed()).resolves.toBe(0);
  });

  test("gives the stored size back when the blob is deleted", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes);
    await releaseStorageLedgerEntries(db, containerName, [blobName]);

    await expect(readStorageBytesUsed()).resolves.toBe(0);
    await expect(db.query.storageLedger.findMany()).resolves.toStrictEqual([]);
  });

  test("releases a second time without decrementing again", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes);
    await releaseStorageLedgerEntries(db, containerName, [blobName]);
    await db.update(users).set({ storageBytesUsed: actualBytes }).where(eq(users.id, userId));
    // The row is what carries the amount, so a redelivered deletion event finds nothing left to give back
    await releaseStorageLedgerEntries(db, containerName, [blobName]);

    await expect(readStorageBytesUsed()).resolves.toBe(actualBytes);
  });

  test("takes nothing off the counter for a hold that never landed", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await releaseStorageLedgerEntries(db, containerName, [blobName]);

    await expect(readStorageBytesUsed()).resolves.toBe(0);
    await expect(db.query.storageLedger.findMany()).resolves.toStrictEqual([]);
  });

  test("releases a whole directory without enumerating it", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes);
    await releaseStorageLedgerEntriesByPrefix(db, containerName, `${resourceId}/`);

    await expect(readStorageBytesUsed()).resolves.toBe(0);
    await expect(db.query.storageLedger.findMany()).resolves.toStrictEqual([]);
  });

  test("leaves another container's blobs alone", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes);
    await releaseStorageLedgerEntries(db, AzureContainer.MessageAssets, [blobName]);

    await expect(readStorageBytesUsed()).resolves.toBe(actualBytes);
  });
});
