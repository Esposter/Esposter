import { z } from "zod";

export class BasicLineChartConfiguration {
  title = "";
}

export const basicLineChartConfigurationSchema = z.object({
  title: z.string(),
}) satisfies z.ZodType<BasicLineChartConfiguration>;
