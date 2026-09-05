import type { Database } from "@esposter/db-schema";

import { chargeStorageLedgerEntry } from "#src/services/storage/chargeStorageLedgerEntry";
import { reconcileStorageLedgerEntry } from "#src/services/storage/reconcileStorageLedgerEntry";
import { releaseStorageLedgerEntries } from "#src/services/storage/releaseStorageLedgerEntries";
import { releaseStorageLedgerEntriesByPrefix } from "#src/services/storage/releaseStorageLedgerEntriesByPrefix";
import { createMockDb } from "@esposter/db-mock";
import { AzureContainer, storageLedger, users } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The counter carries stored bytes and nothing else, so every case here is about which of the two signals —
// Storage saying a blob landed, or a deletion saying it is gone — moved it, and by how much.
describe(releaseStorageLedgerEntries, () => {
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

    await expect(reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes)).resolves.toStrictEqual({
      chargedUserId: userId,
      isMatched: true,
    });
    await expect(readStorageBytesUsed()).resolves.toBe(actualBytes);

    const reconciledStorageLedgerEntry = takeOne(await db.query.storageLedger.findMany());

    expect(reconciledStorageLedgerEntry.countedBytes).toBe(actualBytes);
    expect(reconciledStorageLedgerEntry.declaredBytes).toBe(declaredBytes);
    expect(reconciledStorageLedgerEntry.reconciledAt).not.toBeNull();
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
    // Matched, but no owner comes back: nothing moved, so there is nothing to tell a meter about
    await expect(
      reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes, sequencer),
    ).resolves.toStrictEqual({ isMatched: true });

    await expect(readStorageBytesUsed()).resolves.toBe(overwrittenBytes);

    const storageLedgerEntry = takeOne(await db.query.storageLedger.findMany());

    expect(storageLedgerEntry.countedBytes).toBe(overwrittenBytes);
    expect(storageLedgerEntry.sequencer).toBe(laterSequencer);
  });

  test("applies both sizes in turn when the same events arrive in order", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes, sequencer);

    await expect(readStorageBytesUsed()).resolves.toBe(actualBytes);

    await reconcileStorageLedgerEntry(db, containerName, blobName, overwrittenBytes, laterSequencer);

    await expect(readStorageBytesUsed()).resolves.toBe(overwrittenBytes);
  });

  // A save rewrites one blob name and its event settles that name seconds later, from the Functions host. So a
  // Charge that stood down once the blob had an event would move the counter on a resource's very first save
  // And never again — every save after it counted only by its own event, and nothing at all in the request the
  // Owner's meter is watching
  test("counts each save that follows the blob's first event", async () => {
    expect.hasAssertions();

    await chargeStorageLedgerEntry(db, userId, containerName, blobName, actualBytes);
    await reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes, sequencer);
    await chargeStorageLedgerEntry(db, userId, containerName, blobName, overwrittenBytes);

    await expect(readStorageBytesUsed()).resolves.toBe(overwrittenBytes);
    // The write order is untouched: a charge claims no position, so the next event is still ranked against the
    // Last one that spoke rather than against a charge that cannot be ordered
    const storageLedgerEntry = takeOne(await db.query.storageLedger.findMany());

    expect(storageLedgerEntry.countedBytes).toBe(overwrittenBytes);
    expect(storageLedgerEntry.sequencer).toBe(sequencer);
  });

  // The server's own writes — a resource's content blob — have no reserve to ledger them, so the charge is
  // What both counts them and makes them releasable by the paths that already exist
  test("counts a blob the server wrote for itself", async () => {
    expect.hasAssertions();

    await chargeStorageLedgerEntry(db, userId, containerName, blobName, actualBytes);

    await expect(readStorageBytesUsed()).resolves.toBe(actualBytes);
    const storageLedgerEntry = takeOne(await db.query.storageLedger.findMany());

    expect(storageLedgerEntry.countedBytes).toBe(actualBytes);
    expect(storageLedgerEntry.declaredBytes).toBe(0);
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

    await expect(reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes)).resolves.toStrictEqual({
      isMatched: false,
    });
    await expect(readStorageBytesUsed()).resolves.toBe(0);
  });

  test("gives the stored size back when the blob is deleted", async () => {
    expect.hasAssertions();

    await createStorageLedgerEntry();
    await reconcileStorageLedgerEntry(db, containerName, blobName, actualBytes);
    // The owners come back because the release runs in the Functions host, which has no way to reach their
    // Meters except by being told whose counter it just moved
    await expect(releaseStorageLedgerEntries(db, containerName, [blobName])).resolves.toStrictEqual([userId]);

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
