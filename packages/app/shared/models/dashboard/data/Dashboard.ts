import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { ToData } from "#shared/models/entity/ToData";

import { visualSchema } from "#shared/models/dashboard/data/Visual";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { z } from "zod";

export class Dashboard extends AItemEntity {
  visuals: Visual[] = [];
}

export const dashboardSchema = z.object({ visuals: visualSchema.array() }).merge(aItemEntitySchema) satisfies z.ZodType<
  ToData<Dashboard>
>;
