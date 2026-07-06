import { DocumentType } from "@/models/document/DocumentType";
import { createNameCheckSql, createNameSchema } from "@/models/shared/Name";
import { pgTable } from "@/pgTable";
import { users } from "@/schema/users";
import { check, integer, pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const DOCUMENT_NAME_MAX_LENGTH = 100;

export const documentTypeEnum = pgEnum("document_type", DocumentType);

export const documents = pgTable(
  "documents",
  {
    contentVersion: integer().notNull().default(0),
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    publishedAt: timestamp(),
    publishVersion: integer().notNull().default(0),
    type: documentTypeEnum().notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ name }) => [
      check("documents_name_length_check", createNameCheckSql(name, DOCUMENT_NAME_MAX_LENGTH)),
    ],
  },
);

export type Document = typeof documents.$inferSelect;

export const selectDocumentSchema = createSelectSchema(documents, {
  name: (schema) => createNameSchema(DOCUMENT_NAME_MAX_LENGTH, schema),
});
