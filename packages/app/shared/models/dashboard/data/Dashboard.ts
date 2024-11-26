import type { Visual } from "@/shared/models/dashboard/data/Visual";
import type { Except } from "type-fest";

import { visualSchema } from "@/shared/models/dashboard/data/Visual";
import { applyItemMetadataMixin, itemMetadataSchema } from "@/shared/models/itemMetadata";
import { z } from "zod";

export type Dashboard = typeof Dashboard.prototype;

class BaseDashboard {
  visuals: Visual[] = [];

  toJSON() {
    return JSON.stringify({ ...this });
  }
}
export const Dashboard = applyItemMetadataMixin(BaseDashboard);

export const dashboardSchema = z
  .object({ visuals: z.array(visualSchema) })
  .merge(itemMetadataSchema) satisfies z.ZodType<Except<Dashboard, "toJSON">>;
