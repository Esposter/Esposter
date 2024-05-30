import { BaseChartConfiguration, baseChartConfigurationSchema } from "@/models/dashboard/chart/BaseChartConfiguration";
import { z } from "zod";

export class BasicAreaChartConfiguration extends BaseChartConfiguration {
  subtitle? = "";
}

export const basicAreaChartConfigurationSchema = z
  .object({
    subtitle: z.string().default(""),
  })
  .merge(baseChartConfigurationSchema) satisfies z.ZodType<BasicAreaChartConfiguration>;
