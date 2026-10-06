import { ResourceLinkType } from "#src/models/resource/ResourceLinkType";
import { pgTable } from "#src/pgTable";
import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { resourcesInResource } from "#src/schema/resource/resourcesInResource";
import { index, primaryKey, uuid } from "drizzle-orm/pg-core";

export const resourceLinkTypeEnum = resourceSchema.enum("resourceLinkType", ResourceLinkType);
// Every cross-resource reference a resource's content holds, projected from that content on each save so "what
// Points at this?" is one indexed lookup rather than a read of every blob. The content stays the source of
// Truth: these rows are its index, rewritten whenever the set it projects changes (/docs/architecture/resource-links)
export const resourceLinksInResource = pgTable(
  "resourceLinks",
  {
    // The rows are the source's own projection, so they go with it — a soft delete keeps both
    sourceId: uuid()
      .notNull()
      .references(() => resourcesInResource.id, { onDelete: "cascade" }),
    // No reference: projected from user-authored content on every save, so a `set null` on the target's deletion
    // Would have that content's next save rewrite the dangling id and fail on the constraint. A link to a
    // Deleted target fails soft where it is read instead
    targetId: uuid().notNull(),
    type: resourceLinkTypeEnum().notNull(),
  },
  {
    extraConfig: ({ sourceId, targetId, type }) => [
      primaryKey({ columns: [sourceId, type, targetId] }),
      // The reverse lookup: everything using one target in one role
      index("resourceLinks_target_index").on(targetId, type),
    ],
    schema: resourceSchema,
  },
);

export type ResourceLinkInResource = typeof resourceLinksInResource.$inferSelect;
