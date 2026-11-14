import { StorageTier } from "#src/models/user/StorageTier";
import { authSchema } from "#src/schema/auth/authSchema";
import { URL_MAX_LENGTH } from "#src/services/shared/constants";
import { createEnumColumn } from "#src/services/shared/createEnumColumn";
import { createMaxLengthCheckSql } from "#src/services/shared/createMaxLengthCheckSql";
import { createNameCheckSql } from "#src/services/shared/createNameCheckSql";
import { createNameSchema } from "#src/services/shared/createNameSchema";
import { AUTH_ID_MAX_LENGTH, USER_BIOGRAPHY_MAX_LENGTH, USER_NAME_MAX_LENGTH } from "#src/services/user/constants";
import { sqliteTable } from "#src/sqliteTable";
import { createNormalizedStringSchema } from "@esposter/shared";
import { check, integer, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const usersInAuth = sqliteTable(
  "users",
  {
    biography: text().notNull().default(""),
    // When the person asked to delete their account. The sweep does not read it: its key is the user id on the event,
    // And the row goes last, so a row still carrying this stamp is an account whose sweep has not finished
    deletionRequestedAt: integer({ mode: "timestamp_ms" }),
    email: text().notNull().unique(),
    emailVerified: integer({ mode: "boolean" }).notNull(),
    id: text().primaryKey(),
    image: text().notNull().default(""),
    name: text().notNull(),
    // The running total of blob bytes this user is accountable for, moved only through the storageLedger
    // Ledger so every increment has a row that can later give it back. Stored rather than recomputed:
    // There is no per-user blob prefix or size index, so recomputing means enumerating every directory.
    // A JS number is safe here — a 10 GiB quota is ~1e10, far under the 2^53 integer ceiling.
    storageBytesUsed: integer().notNull().default(0),
    storageTier: createEnumColumn(StorageTier).notNull().default(StorageTier.Free),
  },
  {
    extraConfig: ({ biography, name }) => [
      check("users_biography_length_check", createMaxLengthCheckSql(biography, USER_BIOGRAPHY_MAX_LENGTH)),
      check("users_name_length_check", createNameCheckSql(name, USER_NAME_MAX_LENGTH)),
    ],
    schema: authSchema,
  },
);

export type UserInAuth = typeof usersInAuth.$inferSelect;

export const selectUserInAuthSchema = createSelectSchema(usersInAuth, {
  biography: (schema) => createNormalizedStringSchema(USER_BIOGRAPHY_MAX_LENGTH, schema),
  email: (schema) => schema.pipe(z.email()),
  id: (schema) => schema.max(AUTH_ID_MAX_LENGTH),
  image: (schema) => schema.max(URL_MAX_LENGTH),
  name: (schema) => createNameSchema(USER_NAME_MAX_LENGTH, schema),
});
