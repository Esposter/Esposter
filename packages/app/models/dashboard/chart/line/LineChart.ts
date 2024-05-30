import type { BasicLineChartConfiguration } from "@/models/dashboard/chart/line/configuration/BasicLineChartConfiguration";
import { basicLineChartConfigurationSchema } from "@/models/dashboard/chart/line/configuration/BasicLineChartConfiguration";
import type { DataLabelsLineChartConfiguration } from "@/models/dashboard/chart/line/configuration/DataLabelsLineChartConfiguration";
import { dataLabelsLineChartConfigurationSchema } from "@/models/dashboard/chart/line/configuration/DataLabelsLineChartConfiguration";
import type { LineChartType } from "@/models/dashboard/chart/line/LineChartType";
import { lineChartTypeSchema } from "@/models/dashboard/chart/line/LineChartType";
import { z } from "zod";

export interface LineChart {
  type: LineChartType;
  configuration: BasicLineChartConfiguration | DataLabelsLineChartConfiguration;
}

export const lineChartSchema = z.object({
  type: lineChartTypeSchema,
  configuration: z.union([basicLineChartConfigurationSchema, dataLabelsLineChartConfigurationSchema]),
}) satisfies z.ZodType<LineChart>;
