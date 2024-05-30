import { z } from "zod";

export class BasicLineChartConfiguration {
  title = "";
  subtitle = "";
}

export const basicLineChartConfigurationSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
}) satisfies z.ZodType<BasicLineChartConfiguration>;
