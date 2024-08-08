import {
  BasicChartConfiguration,
  basicChartConfigurationSchema,
} from "@/models/dashboard/chart/BasicChartConfiguration";
import { ChartType, chartTypeSchema } from "@/models/dashboard/chart/type/ChartType";
import { z } from "zod";

export class Chart {
  configuration = new BasicChartConfiguration();
  type: ChartType = ChartType.Basic;
}

export const chartSchema = z.object({
  configuration: basicChartConfigurationSchema,
  type: chartTypeSchema,
}) satisfies z.ZodType<Chart>;
