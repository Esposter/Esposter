import { sql } from "drizzle-orm";
import { integer } from "drizzle-orm/sqlite-core";

// The version every row carries. The database raises it on each change: an insert takes the default, and an update's
// `$onUpdateFn` is embedded in the statement as SQL, so the increment happens inside the same statement the write runs.
// One definition, spread by the D1 wrapper and by each object's tables, so every table gets the column the same way
export const createVersionSchema = () => ({
  version: integer()
    .notNull()
    .default(0)
    .$onUpdateFn(() => sql`${sql.identifier("version")} + 1`),
});

// The version of a row the server does not hold yet: a default answered for an absent row, or a placeholder a client
// Creates before the server answers. Stored versions are never negative, so this is below every one, and the row's
// First arrival applies
export const NO_ROW_VERSION = -1;

export const createMetadataSchema = () => ({
  createdAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  deletedAt: integer({ mode: "timestamp_ms" }),
  updatedAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
  ...createVersionSchema(),
});
