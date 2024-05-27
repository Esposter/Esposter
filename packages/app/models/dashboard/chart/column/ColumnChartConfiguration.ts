import type { BasicColumnChartConfiguration } from "@/models/dashboard/chart/column/BasicColumnChartConfiguration";
import { basicColumnChartConfigurationSchema } from "@/models/dashboard/chart/column/BasicColumnChartConfiguration";
import type { z } from "zod";

export type ColumnChartConfiguration = BasicColumnChartConfiguration;

export const columnChartConfigurationSchema =
  basicColumnChartConfigurationSchema satisfies z.ZodType<ColumnChartConfiguration>;
