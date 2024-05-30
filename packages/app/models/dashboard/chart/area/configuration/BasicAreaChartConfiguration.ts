import { z } from "zod";

export class BasicAreaChartConfiguration {
  title = "";
  subtitle = "";
}

export const basicAreaChartConfigurationSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
}) satisfies z.ZodType<BasicAreaChartConfiguration>;
