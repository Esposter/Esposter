import { resourceTypeSchema, selectResourceSchema } from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

export const resourceFilterInputSchema = z.object({
  // Narrows a read to an explicit set — the search dropdown resolves its own ids this way
  ids: createUniqueArraySchema(selectResourceSchema.shape.id).max(MAX_READ_LIMIT).optional(),
  // Whether the caller has ever opened it, and whether they have starred it. The Recent and Favorites list
  // Views are these two filters and nothing else, so each inherits every other filter, the row count and the
  // Summary cards rather than re-implementing the workbench against its own read
  isAccessed: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  searchQuery: z.string().optional(),
  // The Tag pill's value is optional, and containment cannot express "has this tag, any value" —
  // That is key-existence, so the two filters are separate inputs rather than one nullable record
  tagName: z.string().optional(),
  // Filters are lookups, not writes: an unsaveable tag (over-length, blank name) can simply never
  // Match, so reusing the write-time resourceTagsSchema here would only turn "no results" into a
  // Rejected query that errors the whole list
  tags: z.record(z.string(), z.string()).optional(),
  types: createUniqueArraySchema(resourceTypeSchema).optional(),
  updatedAfter: z.date().optional(),
  updatedBefore: z.date().optional(),
});
export type ResourceFilterInput = z.infer<typeof resourceFilterInputSchema>;
