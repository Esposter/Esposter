import type { AnyPgColumn } from "drizzle-orm/pg-core";

import { createMaxLengthCheckSql } from "#src/models/shared/Check";
import { pgTable } from "#src/pgTable";
import { users } from "#src/schema/users";
import { sanitizeTextHtml } from "@esposter/shared";
import { sql } from "drizzle-orm";
import { check, doublePrecision, index, integer, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const POST_TITLE_MAX_LENGTH = 300;
export const POST_DESCRIPTION_MAX_LENGTH = 1000;

export const posts = pgTable(
  "posts",
  {
    // Every post above this one, root first. A comment is a post with a parent, so a thread is a chain that can
    // Run to any depth — and both writes a reply forces are questions about that chain: which counters move, and
    // How many rows a delete takes with it. Holding the chain on the row answers both with an ordinary predicate,
    // Where deriving it would mean walking the table a level at a time on every write
    ancestorIds: uuid().array().notNull().default([]),
    depth: integer().notNull().default(0),
    description: text().notNull().default(""),
    id: uuid().primaryKey().defaultRandom(),
    noComments: integer().notNull().default(0),
    noLikes: integer().notNull().default(0),
    parentId: uuid().references((): AnyPgColumn => posts.id, { onDelete: "cascade" }),
    ranking: doublePrecision().notNull(),
    title: text().notNull().default(""),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ ancestorIds, description, parentId, title }) => [
      // We don't check if title is min(1) here because posts can be comments that have no title
      check("posts_title_length_check", createMaxLengthCheckSql(title, POST_TITLE_MAX_LENGTH)),
      check("posts_description_length_check", createMaxLengthCheckSql(description, POST_DESCRIPTION_MAX_LENGTH)),
      // A foreign key gets no index of its own in Postgres, and every read of a thread asks this one question:
      // One parent's children, best first. A tree asks it once per open branch, and the feed asks it too — a
      // Root post is the parent that is null
      index("posts_parentId_ranking_index").on(parentId, sql`"ranking" DESC`, sql`"id" DESC`),
      // Containment is the whole-subtree question, which only a delete asks — the size of what its cascade is
      // About to take
      index("posts_ancestorIds_index").using("gin", ancestorIds),
    ],
  },
);

export type Post = typeof posts.$inferSelect;

export const selectPostSchema = createSelectSchema(posts, {
  description: (schema) => schema.transform(sanitizeTextHtml).pipe(z.string().max(POST_DESCRIPTION_MAX_LENGTH)),
  title: (schema) => schema.min(1).max(POST_TITLE_MAX_LENGTH),
});
export const selectCommentSchema = createSelectSchema(posts, {
  description: (schema) => schema.transform(sanitizeTextHtml).pipe(z.string().min(1).max(POST_DESCRIPTION_MAX_LENGTH)),
});
