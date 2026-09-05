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
    // Every post above this one, root first. Both writes a reply forces are questions about that chain — which
    // Counters move, and how many rows a delete takes with it — and holding it on the row answers both with an
    // Ordinary predicate rather than a walk down a level at a time
    ancestorIds: uuid().array().notNull().default([]),
    commentCount: integer().notNull().default(0),
    depth: integer().notNull().default(0),
    description: text().notNull().default(""),
    id: uuid().primaryKey().defaultRandom(),
    likeCount: integer().notNull().default(0),
    parentId: uuid().references((): AnyPgColumn => posts.id, { onDelete: "cascade" }),
    ranking: doublePrecision().notNull(),
    title: text().notNull().default(""),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ ancestorIds, description, parentId, title }) => [
      // No min(1): a post may be a comment, which has no title
      check("posts_title_length_check", createMaxLengthCheckSql(title, POST_TITLE_MAX_LENGTH)),
      check("posts_description_length_check", createMaxLengthCheckSql(description, POST_DESCRIPTION_MAX_LENGTH)),
      // A foreign key gets no index of its own in Postgres, and every read of a thread asks this one question:
      // One parent's children, best first. The feed asks it too — a root post is the parent that is null
      index("posts_parentId_ranking_index").on(parentId, sql`"ranking" DESC`, sql`"id" DESC`),
      // Containment is the whole-subtree question, which only a delete asks — the size of what its cascade takes
      index("posts_ancestorIds_index").using("gin", ancestorIds),
    ],
  },
);

export type Post = typeof posts.$inferSelect;

// A comment's description is the whole comment, so it is the one that may not be blank — everything else about
// The two is the same field, sanitized the same way against the same cap
const createDescriptionSchema = (schema: z.ZodString, minLength: number) =>
  schema.transform(sanitizeTextHtml).pipe(z.string().min(minLength).max(POST_DESCRIPTION_MAX_LENGTH));

export const selectPostSchema = createSelectSchema(posts, {
  description: (schema) => createDescriptionSchema(schema, 0),
  title: (schema) => schema.min(1).max(POST_TITLE_MAX_LENGTH),
});
export const selectCommentSchema = createSelectSchema(posts, {
  description: (schema) => createDescriptionSchema(schema, 1),
});
