import type { Chart } from "@/shared/models/dashboard/data/chart/Chart";
import type { LayoutItem } from "@/shared/models/dashboard/data/LayoutItem";
import type { VisualType } from "@/shared/models/dashboard/data/VisualType";
import type { AItemEntity } from "@/shared/models/entity/AItemEntity";
import type { ItemEntityType } from "@/shared/models/entity/ItemEntityType";

import { chartSchema } from "@/shared/models/dashboard/data/chart/Chart";
import { layoutItemSchema } from "@/shared/models/dashboard/data/LayoutItem";
import { visualTypeSchema } from "@/shared/models/dashboard/data/VisualType";
import { aItemEntitySchema } from "@/shared/models/entity/AItemEntity";
import { createItemEntityTypeSchema } from "@/shared/models/entity/ItemEntityType";
import { z } from "zod";

export interface Visual extends AItemEntity, ItemEntityType<VisualType>, LayoutItem {
  chart: Chart;
}

export const visualSchema = aItemEntitySchema
  .merge(createItemEntityTypeSchema(visualTypeSchema))
  .merge(layoutItemSchema)
  .merge(z.object({ chart: chartSchema })) satisfies z.ZodType<Visual>;
