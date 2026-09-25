import {
  MAX_TAG_NAME_LENGTH,
  MAX_TAG_VALUE_LENGTH,
  RESOURCE_NAME_MAX_LENGTH,
  ResourceTypes,
  resourceTypeSchema,
  selectResourceSchema,
} from "@esposter/db-schema";
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
  // A match is a substring of a name, so a query longer than any name can match nothing
  searchQuery: z.string().max(RESOURCE_NAME_MAX_LENGTH).optional(),
  // The Tag pill's value is optional, and containment cannot express "has this tag, any value" —
  // That is key-existence, so the two filters are separate inputs rather than one nullable record
  tagName: z.string().max(MAX_TAG_NAME_LENGTH).optional(),
  // Filters are lookups, not writes: an unsaveable tag (over-length, blank name) can simply never
  // Match, so reusing the write-time resourceTagsSchema here would only turn "no results" into a
  // Rejected query that errors the whole list. Its lengths are bounded all the same — a tag longer than any tag can
  // Be matches nothing either way, and the body is not a place to hand the query an arbitrarily large string
  tags: z.record(z.string().max(MAX_TAG_NAME_LENGTH), z.string().max(MAX_TAG_VALUE_LENGTH)).optional(),
  types: createUniqueArraySchema(resourceTypeSchema).max(ResourceTypes.length).optional(),
  updatedAfter: z.date().optional(),
  updatedBefore: z.date().optional(),
});
export type ResourceFilterInput = z.infer<typeof resourceFilterInputSchema>;
