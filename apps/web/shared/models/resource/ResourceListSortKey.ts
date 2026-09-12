import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { ResourceListItemPropertyNames } from "#shared/models/resource/ResourceListItem";
import { selectResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

export type ResourceListSortKey = keyof ResourceListItem;

export const resourceListSortKeySchema: z.ZodType<ResourceListSortKey> = z.union([
  selectResourceSchema.keyof(),
  z.literal(ResourceListItemPropertyNames.lastAccessedAt),
]);
