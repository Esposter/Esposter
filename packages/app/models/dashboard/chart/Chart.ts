import {
  BasicChartConfiguration,
  basicChartConfigurationSchema,
} from "@/models/dashboard/chart/BasicChartConfiguration";
import { ChartType, chartTypeSchema } from "@/models/dashboard/chart/ChartType";
import { z } from "zod";

export class Chart {
  type = ChartType.Basic;
  configuration = new BasicChartConfiguration();
}

export const chartSchema = z.object({
  type: chartTypeSchema,
  configuration: basicChartConfigurationSchema,
}) satisfies z.ZodType<Chart>;
