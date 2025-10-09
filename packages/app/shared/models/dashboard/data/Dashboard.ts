import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { ToData } from "@esposter/shared";

import { visualSchema } from "#shared/models/dashboard/data/Visual";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { z } from "zod";

export class Dashboard extends AItemEntity {
  visuals: Visual[] = [];

  constructor(init?: Partial<Dashboard>) {
    super();
    Object.assign(this, init);
  }
}

export const dashboardSchema = z.object({
  ...aItemEntitySchema.shape,
  visuals: visualSchema.array(),
}) satisfies z.ZodType<ToData<Dashboard>>;
