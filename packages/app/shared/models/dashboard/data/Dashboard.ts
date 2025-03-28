import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { ToData } from "#shared/models/entity/ToData";
import type { Except } from "type-fest";

import { visualSchema } from "#shared/models/dashboard/data/Visual";
import { applyItemMetadataMixin, itemMetadataSchema } from "#shared/models/entity/ItemMetadata";
import { Serializable } from "#shared/models/entity/Serializable";
import { z } from "zod";

class BaseDashboard extends Serializable {
  visuals: Visual[] = [];
}
export const Dashboard = applyItemMetadataMixin(BaseDashboard);
export type Dashboard = typeof Dashboard.prototype;

export const dashboardSchema = z
  .object({ visuals: z.array(visualSchema) })
  .merge(itemMetadataSchema) satisfies z.ZodType<ToData<Except<Dashboard, "visuals"> & { visuals: ToData<Visual>[] }>>;
