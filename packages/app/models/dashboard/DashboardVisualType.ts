import { z } from "zod";

export enum DashboardVisualType {
  Area = "Area",
  Column = "Column",
  Line = "Line",
}

export const dashboardVisualTypeSchema = z.nativeEnum(DashboardVisualType) satisfies z.ZodType<DashboardVisualType>;
