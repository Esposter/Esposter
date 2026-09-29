import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { ResourceListItemPropertyNames } from "#shared/models/resource/ResourceListItem";
import { selectResourceInResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

export type ResourceListSortKey = keyof ResourceListItem;

export const resourceListSortKeySchema = z.union([
  selectResourceInResourceSchema.keyof(),
  z.literal(ResourceListItemPropertyNames.lastAccessedAt),
]) satisfies z.ZodType<ResourceListSortKey>;
