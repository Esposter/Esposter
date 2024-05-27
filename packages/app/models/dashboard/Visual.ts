import type { ChartConfiguration } from "@/models/dashboard/chart/ChartConfiguration";
import { chartConfigurationSchema } from "@/models/dashboard/chart/ChartConfiguration";
import { layoutItemSchema } from "@/models/dashboard/LayoutItem";
import type { VisualType } from "@/models/dashboard/VisualType";
import { visualTypeSchema } from "@/models/dashboard/VisualType";
import type { LayoutItem } from "grid-layout-plus";
import { z } from "zod";

export interface Visual extends LayoutItem {
  i: string;
  type: VisualType;
  configuration: ChartConfiguration;
}

export const visualSchema = z
  .object({ type: visualTypeSchema, configuration: chartConfigurationSchema })
  .merge(layoutItemSchema) satisfies z.ZodType<Visual>;
