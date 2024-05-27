import { ColumnChartType, columnChartTypeSchema } from "@/models/dashboard/chart/column/ColumnChartType";
import { z } from "zod";

export class ColumnChartConfiguration {
  type = ColumnChartType.Basic;
}

export const columnChartConfigurationSchema = z.object({
  type: columnChartTypeSchema,
}) satisfies z.ZodType<ColumnChartConfiguration>;
