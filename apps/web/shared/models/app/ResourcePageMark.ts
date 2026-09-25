import type { ResourceType } from "@esposter/db-schema";
import type { ItemEntityType } from "@esposter/shared";

import { PageMarkType } from "#shared/models/app/PageMarkType";
import { resourceTypeSchema } from "@esposter/db-schema";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

// A resource's page, marked by its type, whose icon the dock reads off the resource definitions when it draws it
export interface ResourcePageMark extends ItemEntityType<PageMarkType.Resource> {
  resourceType: ResourceType;
}

export const resourcePageMarkSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(PageMarkType.Resource)).shape,
  resourceType: resourceTypeSchema,
}) satisfies z.ZodType<ResourcePageMark>;
