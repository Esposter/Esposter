import { BaseChartConfiguration, baseChartConfigurationSchema } from "@/models/dashboard/chart/BaseChartConfiguration";
import { z } from "zod";

export class BasicLineChartConfiguration extends BaseChartConfiguration {
  subtitle? = "";
}

export const basicLineChartConfigurationSchema = baseChartConfigurationSchema.merge(
  z.object({
    subtitle: z.string().default(""),
  }),
) satisfies z.ZodType<BasicLineChartConfiguration>;
