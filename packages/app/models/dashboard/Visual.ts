import type { Chart } from "@/models/dashboard/chart/Chart";
import type { LayoutItem } from "@/models/dashboard/LayoutItem";
import type { VisualType } from "@/models/dashboard/VisualType";
import type { AItemEntity } from "@/models/shared/entity/AItemEntity";
import type { ItemEntityType } from "@/models/shared/entity/ItemEntityType";

import { chartSchema } from "@/models/dashboard/chart/Chart";
import { layoutItemSchema } from "@/models/dashboard/LayoutItem";
import { visualTypeSchema } from "@/models/dashboard/VisualType";
import { aItemEntitySchema } from "@/models/shared/entity/AItemEntity";
import { createItemEntityTypeSchema } from "@/models/shared/entity/ItemEntityType";
import { z } from "zod";

export interface Visual extends AItemEntity, ItemEntityType<VisualType>, LayoutItem {
  chart: Chart;
}

export const visualSchema = aItemEntitySchema
  .merge(createItemEntityTypeSchema(visualTypeSchema))
  .merge(layoutItemSchema)
  .merge(z.object({ chart: chartSchema })) satisfies z.ZodType<Visual>;
