import {
    BasicChartConfiguration,
    basicChartConfigurationSchema,
} from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import { ChartType, chartTypeSchema } from "#shared/models/dashboard/data/chart/type/ChartType";
import { z } from "zod";

export class Chart {
  configuration = new BasicChartConfiguration();
  type: ChartType = ChartType.Basic;
}

export const chartSchema = z.object({
  configuration: basicChartConfigurationSchema,
  type: chartTypeSchema,
}) satisfies z.ZodType<Chart>;
