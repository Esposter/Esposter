import type { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";
import { dashboardVisualTypeSchema } from "@/models/dashboard/DashboardVisualType";
import { layoutItemSchema } from "@/models/dashboard/LayoutItem";
import type { LayoutItem } from "grid-layout-plus";
import { z } from "zod";

export interface DashboardVisual extends LayoutItem {
  i: string;
  type: DashboardVisualType;
}

export const dashboardVisualSchema = z
  .object({ type: dashboardVisualTypeSchema })
  .merge(layoutItemSchema) satisfies z.ZodType<DashboardVisual>;
