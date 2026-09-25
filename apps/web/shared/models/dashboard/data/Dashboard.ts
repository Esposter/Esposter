import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { ToData } from "@esposter/shared";

import { visualSchema } from "#shared/models/dashboard/data/Visual";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";
import { MAX_RESOURCE_CONTENT_LENGTH } from "#shared/services/resource/constants";

export class Dashboard extends AItemEntity {
  visuals: Visual[] = [];

  constructor(init?: Partial<Dashboard>) {
    super();
    Object.assign(this, init);
  }
}

export const dashboardSchema = z.object({
  ...aItemEntitySchema.shape,
  visuals: createUniqueArraySchema(visualSchema, "id").max(MAX_RESOURCE_CONTENT_LENGTH),
}) satisfies z.ZodType<ToData<Dashboard>>;
