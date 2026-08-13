import { createMaxLengthCheckSql } from "@/models/shared/Check";
import { createNameCheckSql, createNameSchema } from "@/models/shared/Name";
import { StorageTier } from "@/models/user/StorageTier";
import { pgTable } from "@/pgTable";
import { createNormalizedStringSchema } from "@esposter/shared";
import { bigint, boolean, check, pgEnum, text } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const USER_BIOGRAPHY_MAX_LENGTH = 160;
export const USER_NAME_MAX_LENGTH = 100;

export const storageTierEnum = pgEnum("storageTier", StorageTier);

export const users = pgTable(
  "users",
  {
    biography: text().notNull().default(""),
    email: text().notNull().unique(),
    emailVerified: boolean().notNull(),
    id: text().primaryKey(),
    image: text().notNull().default(""),
    name: text().notNull(),
    // The running total of blob bytes this user is accountable for, moved only through the storageBlobs
    // Ledger so every increment has a row that can later give it back. Stored rather than recomputed:
    // There is no per-user blob prefix or size index, so recomputing means enumerating every directory.
    // `number` mode is safe — a 10 GiB quota is ~1e10, far under the 2^53 integer ceiling.
    storageBytesUsed: bigint({ mode: "number" }).notNull().default(0),
    storageTier: storageTierEnum().notNull().default(StorageTier.Free),
  },
  {
    extraConfig: ({ biography, name }) => [
      check("users_biography_length_check", createMaxLengthCheckSql(biography, USER_BIOGRAPHY_MAX_LENGTH)),
      check("users_name_length_check", createNameCheckSql(name, USER_NAME_MAX_LENGTH)),
    ],
  },
);

export type User = typeof users.$inferSelect;

export const selectUserSchema = createSelectSchema(users, {
  biography: (schema) => createNormalizedStringSchema(USER_BIOGRAPHY_MAX_LENGTH, schema),
  email: (schema) => schema.pipe(z.email()),
  name: (schema) => createNameSchema(USER_NAME_MAX_LENGTH, schema),
});
