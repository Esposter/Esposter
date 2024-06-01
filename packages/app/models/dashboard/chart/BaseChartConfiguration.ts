import { z } from "zod";

export class BaseChartConfiguration {
  title? = "";
  subtitle? = "";
}

export const baseChartConfigurationSchema = z.object({
  title: z.string().default(""),
  subtitle: z.string().default(""),
}) satisfies z.ZodType<BaseChartConfiguration>;
