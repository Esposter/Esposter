import { BaseChartConfiguration, baseChartConfigurationSchema } from "@/models/dashboard/chart/BaseChartConfiguration";
import { z } from "zod";

export class BasicColumnChartConfiguration extends BaseChartConfiguration {
  subtitle = "";
}

export const basicColumnChartConfigurationSchema = z
  .object({
    subtitle: z.string(),
  })
  .merge(baseChartConfigurationSchema) satisfies z.ZodType<BasicColumnChartConfiguration>;
