import { BaseChartConfiguration, baseChartConfigurationSchema } from "@/models/dashboard/chart/BaseChartConfiguration";
import { z } from "zod";

export class BasicAreaChartConfiguration extends BaseChartConfiguration {
  subtitle? = "";
}

export const basicAreaChartConfigurationSchema = baseChartConfigurationSchema.merge(
  z.object({
    subtitle: z.string().default(""),
  }),
) satisfies z.ZodType<BasicAreaChartConfiguration>;
