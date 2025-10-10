import type { LayoutItem } from "#shared/models/dashboard/data/LayoutItem";
import type { ItemEntityType, ToData } from "@esposter/shared";

import { Chart, chartSchema } from "#shared/models/dashboard/data/chart/Chart";
import { layoutItemSchema } from "#shared/models/dashboard/data/LayoutItem";
import { VisualType, visualTypeSchema } from "#shared/models/dashboard/data/VisualType";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export class Visual extends AItemEntity implements ItemEntityType<VisualType>, LayoutItem {
  chart = new Chart();
  h = 4;
  i: string;
  type = VisualType.Area;
  w = 4;
  x = 0;
  y = 0;

  constructor(init?: Partial<Visual>) {
    super();
    Object.assign(this, init);
    this.i = this.id;
  }
}

export const visualSchema = z.object({
  ...aItemEntitySchema.shape,
  ...createItemEntityTypeSchema(visualTypeSchema).shape,
  ...layoutItemSchema.shape,
  chart: chartSchema,
}) satisfies z.ZodType<ToData<Visual>>;
