import { BaseChartConfiguration, baseChartConfigurationSchema } from "@/models/dashboard/chart/BaseChartConfiguration";
import { z } from "zod";

export class BasicLineChartConfiguration extends BaseChartConfiguration {
  subtitle = "";
}

export const basicLineChartConfigurationSchema = z
  .object({
    subtitle: z.string(),
  })
  .merge(baseChartConfigurationSchema) satisfies z.ZodType<BasicLineChartConfiguration>;
