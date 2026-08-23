import { AzureContainer } from "#src/models/azure/container/AzureContainer";
import { pgTable } from "#src/pgTable";
import { users } from "#src/schema/users";
import { sql } from "drizzle-orm";
import { bigint, check, index, pgEnum, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const azureContainerEnum = pgEnum("azureContainer", AzureContainer);
// The per-blob ledger behind `users.storageBytesUsed`: one row per write target this user was handed, holding
// Exactly the bytes the counter is carrying on its behalf. Every increment of the counter writes a row in the
// Same transaction, so a crash can never leave bytes held with nothing left to give them back, and every
// Decrement reads its amount off the row rather than recomputing it — which is also the only way a delete can
// Attribute a blob to an owner at all (a message asset is keyed by room, not by uploader).
//
// A row is born unreconciled, carrying the size the client *declared* before it uploaded anything. Storage's
// Own `BlobCreated` is what turns it into the truth, replacing the declaration with the stored object's real
// Size. Nothing settles the rest: past `expiresAt` the write SAS is dead, so a hold that never landed simply
// Stops counting. The row itself outlives that, because a `BlobCreated` for a blob that did land can still be
// Inside the delivery window — a later reserve by that user drops it only once no such event can still arrive.
export const storageBlobs = pgTable(
  "storageBlobs",
  {
    blobName: text().notNull(),
    containerName: azureContainerEnum().notNull(),
    // What the counter is holding for this blob right now — zero until reconciliation reads the stored object's
    // Real size back, because nothing is charged before then and `declaredBytes` is what holds the space in the
    // Meantime. Kept separate so the adjustment is a difference, never a re-read.
    countedBytes: bigint({ mode: "number" }).notNull(),
    declaredBytes: bigint({ mode: "number" }).notNull(),
    expiresAt: timestamp().notNull(),
    reconciledAt: timestamp(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ blobName, containerName, countedBytes, declaredBytes, reconciledAt, userId }) => [
      primaryKey({ columns: [containerName, blobName] }),
      check("storageBlobs_declaredBytes_check", sql`${declaredBytes} >= 0`),
      check("storageBlobs_countedBytes_check", sql`${countedBytes} >= 0`),
      // Backs the outstanding-reservation cap and the expired-hold collection, both of which lead with the
      // User on every reserve. No index leads with `reconciledAt`: nothing scans the ledger account-wide
      index("storageBlobs_userId_reconciledAt_index").on(userId, reconciledAt),
    ],
  },
);

export type StorageBlob = typeof storageBlobs.$inferSelect;
