import type { ColumnChartType } from "@/models/dashboard/chart/column/ColumnChartType";
import { columnChartTypeSchema } from "@/models/dashboard/chart/column/ColumnChartType";
import type { BasicColumnChartConfiguration } from "@/models/dashboard/chart/column/configuration/BasicColumnChartConfiguration";
import { basicColumnChartConfigurationSchema } from "@/models/dashboard/chart/column/configuration/BasicColumnChartConfiguration";
import { z } from "zod";

export interface ColumnChart {
  type: ColumnChartType;
  configuration: BasicColumnChartConfiguration;
}

export const columnChartSchema = z.object({
  type: columnChartTypeSchema,
  configuration: basicColumnChartConfigurationSchema,
}) satisfies z.ZodType<ColumnChart>;
