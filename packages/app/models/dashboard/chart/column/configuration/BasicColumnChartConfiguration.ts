import { BaseChartConfiguration, baseChartConfigurationSchema } from "@/models/dashboard/chart/BaseChartConfiguration";
import { z } from "zod";

export class BasicColumnChartConfiguration extends BaseChartConfiguration {
  subtitle? = "";
}

export const basicColumnChartConfigurationSchema = baseChartConfigurationSchema.merge(
  z.object({
    subtitle: z.string().default(""),
  }),
) satisfies z.ZodType<BasicColumnChartConfiguration>;
