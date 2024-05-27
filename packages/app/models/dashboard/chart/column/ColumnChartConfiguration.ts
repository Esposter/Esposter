import type { BasicColumnChartConfiguration } from "@/models/dashboard/chart/column/BasicColumnChartConfiguration";
import { basicColumnChartConfigurationSchema } from "@/models/dashboard/chart/column/BasicColumnChartConfiguration";
import { z } from "zod";

export type ColumnChartConfiguration = BasicColumnChartConfiguration;

export const columnChartConfigurationSchema = z.union([
  basicColumnChartConfigurationSchema,
]) satisfies z.ZodType<ColumnChartConfiguration>;
