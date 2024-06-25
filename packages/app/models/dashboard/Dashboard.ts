import type { Visual } from "@/models/dashboard/Visual";
import { visualSchema } from "@/models/dashboard/Visual";
import { applyItemMetadataMixin, itemMetadataSchema } from "@/models/shared/ItemMetadata";
import type { Except } from "type-fest";
import { z } from "zod";

class BaseDashboard {
  visuals: Visual[] = [];

  toJSON() {
    return JSON.stringify({ ...this });
  }
}

export type Dashboard = typeof Dashboard.prototype;
export const Dashboard = applyItemMetadataMixin(BaseDashboard);

export const dashboardSchema = z
  .object({ visuals: z.array(visualSchema) })
  .merge(itemMetadataSchema) satisfies z.ZodType<Except<Dashboard, "toJSON">>;
