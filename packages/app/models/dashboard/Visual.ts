import type { ChartConfiguration } from "@/models/dashboard/chart/ChartConfiguration";
import { chartConfigurationSchema } from "@/models/dashboard/chart/ChartConfiguration";
import { layoutItemSchema } from "@/models/dashboard/LayoutItem";
import type { VisualType } from "@/models/dashboard/VisualType";
import { visualTypeSchema } from "@/models/dashboard/VisualType";
import type { AItemEntity } from "@/models/shared/entity/AItemEntity";
import { aItemEntitySchema } from "@/models/shared/entity/AItemEntity";
import type { ItemEntityType } from "@/models/shared/entity/ItemEntityType";
import { createItemEntityTypeSchema } from "@/models/shared/entity/ItemEntityType";
import type { LayoutItem } from "grid-layout-plus";
import { z } from "zod";

export interface Visual extends AItemEntity, ItemEntityType<VisualType>, LayoutItem {
  configuration: ChartConfiguration;
}

export const visualSchema = z
  .object({ configuration: chartConfigurationSchema })
  .merge(aItemEntitySchema)
  .merge(createItemEntityTypeSchema(visualTypeSchema))
  .merge(layoutItemSchema) satisfies z.ZodType<Visual>;
