import type { ResourceType } from "@esposter/db-schema";
import type { ItemEntityType } from "@esposter/shared";

import { PageMarkType } from "#shared/models/app/PageMarkType";
import { resourceTypeSchema, selectResourceInResourceSchema } from "@esposter/db-schema";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

// A resource's page, marked by the resource and its type, whose icon the dock reads off the resource definitions when it
// Draws it. The id is the resource a bookmark of the page names
export interface ResourcePageMark extends ItemEntityType<PageMarkType.Resource> {
  id: string;
  resourceType: ResourceType;
}

export const resourcePageMarkSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(PageMarkType.Resource)).shape,
  id: selectResourceInResourceSchema.shape.id,
  resourceType: resourceTypeSchema,
}) satisfies z.ZodType<ResourcePageMark>;
