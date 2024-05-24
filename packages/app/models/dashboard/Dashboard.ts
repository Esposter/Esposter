import type { DashboardVisual } from "@/models/dashboard/DashboardVisual";
import { dashboardVisualSchema } from "@/models/dashboard/DashboardVisual";
import { applyItemMetadataMixin, itemMetadataSchema } from "@/models/shared/ItemMetadata";
import type { Except } from "type-fest";
import { z } from "zod";

class BaseDashboard {
  visuals: DashboardVisual[] = [];

  constructor(init?: Partial<BaseDashboard>) {
    Object.assign(this, init);
  }

  toJSON() {
    return JSON.stringify({ ...this });
  }
}

export type Dashboard = typeof Dashboard.prototype;
export const Dashboard = applyItemMetadataMixin(BaseDashboard);

export const dashboardSchema = z
  .object({ visuals: z.array(dashboardVisualSchema) })
  .merge(itemMetadataSchema) satisfies z.ZodType<Except<Dashboard, "toJSON">>;
