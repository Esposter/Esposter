import {
  BasicChartConfiguration,
  basicChartConfigurationSchema,
} from "@/models/dashboard/chart/BasicChartConfiguration";
import { ChartType, chartTypeSchema } from "@/models/dashboard/chart/type/ChartType";
import { z } from "zod";

export class Chart {
  type: ChartType = ChartType.Basic;
  configuration = new BasicChartConfiguration();
}

export const chartSchema = z.object({
  type: chartTypeSchema,
  configuration: basicChartConfigurationSchema,
}) satisfies z.ZodType<Chart>;
