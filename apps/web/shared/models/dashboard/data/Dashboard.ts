import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { ToData } from "@esposter/shared";

import { visualSchema } from "#shared/models/dashboard/data/Visual";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export class Dashboard extends AItemEntity {
  visuals: Visual[] = [];

  constructor(init?: Partial<Dashboard>) {
    super();
    Object.assign(this, init);
  }
}

// oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- the visual enums are the same declarations Visual.ts:28 names (VisualType.ts:4, chart/type/ChartType.ts:8); the rule flags a zod object nested in an array even on an exact enum match
export const dashboardSchema = z.object({
  ...aItemEntitySchema.shape,
  visuals: createUniqueArraySchema(visualSchema, "id").max(MAX_RESOURCE_CONTENT_SIZE),
}) satisfies z.ZodType<ToData<Dashboard>>;
