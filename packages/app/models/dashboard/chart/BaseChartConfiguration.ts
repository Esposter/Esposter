import { z } from "zod";

export class BaseChartConfiguration {
  title? = "";
}

export const baseChartConfigurationSchema = z.object({
  title: z.string().default(""),
}) satisfies z.ZodType<BaseChartConfiguration>;
