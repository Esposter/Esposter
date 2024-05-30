import { z } from "zod";

export class BaseChartConfiguration {
  title = "";
}

export const baseChartConfigurationSchema = z.object({
  title: z.string(),
}) satisfies z.ZodType<BaseChartConfiguration>;
