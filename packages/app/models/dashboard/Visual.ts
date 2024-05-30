import type { Chart } from "@/models/dashboard/chart/Chart";
import { chartSchema } from "@/models/dashboard/chart/Chart";
import type { LayoutItem } from "@/models/dashboard/LayoutItem";
import { layoutItemSchema } from "@/models/dashboard/LayoutItem";
import type { VisualType } from "@/models/dashboard/VisualType";
import { visualTypeSchema } from "@/models/dashboard/VisualType";
import type { AItemEntity } from "@/models/shared/entity/AItemEntity";
import { aItemEntitySchema } from "@/models/shared/entity/AItemEntity";
import type { ItemEntityType } from "@/models/shared/entity/ItemEntityType";
import { createItemEntityTypeSchema } from "@/models/shared/entity/ItemEntityType";
import { z } from "zod";

export interface Visual extends AItemEntity, ItemEntityType<VisualType>, LayoutItem {
  chart: Chart;
}

export const visualSchema = z
  .object({ chart: chartSchema })
  .merge(aItemEntitySchema)
  .merge(createItemEntityTypeSchema(visualTypeSchema))
  .merge(layoutItemSchema) satisfies z.ZodType<Visual>;
