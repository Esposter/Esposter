import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { ToData } from "@esposter/shared";

import { visualSchema } from "#shared/models/dashboard/data/Visual";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { CollisionMode, CompactType } from "vue-grid-layout-headless";
import { z } from "zod";

export class Dashboard extends AItemEntity {
  // How the visuals pack, and what a drop does on the visual it lands on
  collision = CollisionMode.Push;
  compactType = CompactType.Vertical;
  visuals: Visual[] = [];

  constructor(init?: Partial<Dashboard>) {
    super();
    Object.assign(this, init);
  }
}

// oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- the visual enums are the same declarations Visual.ts:28 names (VisualType.ts:4, chart/type/ChartType.ts:8); the rule flags a zod object nested in an array even on an exact enum match
export const dashboardSchema = z.object({
  ...aItemEntitySchema.shape,
  collision: z.enum(CollisionMode),
  compactType: z.enum(CompactType),
  visuals: createUniqueArraySchema(visualSchema, "id").max(MAX_RESOURCE_CONTENT_SIZE),
}) satisfies z.ZodType<ToData<Dashboard>>;
