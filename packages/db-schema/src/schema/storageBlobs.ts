import { AzureContainer } from "@/models/azure/container/AzureContainer";
import { pgTable } from "@/pgTable";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { bigint, check, index, pgEnum, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const azureContainerEnum = pgEnum("azure_container", AzureContainer);
// The per-blob ledger behind `users.storageBytesUsed`: one row per write target this user was handed, holding
// Exactly the bytes the counter is carrying on its behalf. Every increment of the counter writes a row in the
// Same transaction, so a crash can never leave bytes held with nothing left to give them back, and every
// Decrement reads its amount off the row rather than recomputing it — which is also the only way a delete can
// Attribute a blob to an owner at all (a message asset is keyed by room, not by uploader).
//
// A row is born unreconciled, carrying the size the client *declared* before it uploaded anything. The settle
// Sweep is what turns it into the truth: past `expiresAt` the write SAS is dead, so whatever is in blob storage
// Is final — the blob's real size replaces the declaration, or the row is dropped and its bytes returned.
export const storageBlobs = pgTable(
  "storage_blobs",
  {
    blobName: text().notNull(),
    containerName: azureContainerEnum().notNull(),
    // What the counter is holding for this blob right now. Equal to `declaredBytes` until the sweep reconciles
    // It to the stored object's real size — kept separate so the adjustment is a difference, never a re-read.
    countedBytes: bigint({ mode: "number" }).notNull(),
    declaredBytes: bigint({ mode: "number" }).notNull(),
    expiresAt: timestamp().notNull(),
    reconciledAt: timestamp(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ blobName, containerName, countedBytes, declaredBytes, expiresAt, reconciledAt, userId }) => [
      primaryKey({ columns: [containerName, blobName] }),
      check("storage_blobs_declared_bytes_check", sql`${declaredBytes} >= 0`),
      check("storage_blobs_counted_bytes_check", sql`${countedBytes} >= 0`),
      // The sweep's only query: rows whose SAS has died without their real size ever being read back
      index("storage_blobs_reconciledAt_expiresAt_index").on(reconciledAt, expiresAt),
      // Backs the outstanding-reservation cap, which is counted per user on every reserve
      index("storage_blobs_userId_reconciledAt_index").on(userId, reconciledAt),
    ],
  },
);

export type StorageBlob = typeof storageBlobs.$inferSelect;

export const selectStorageBlobSchema = createSelectSchema(storageBlobs);
