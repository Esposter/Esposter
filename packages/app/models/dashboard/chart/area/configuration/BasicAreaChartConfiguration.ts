import { z } from "zod";

export class BasicAreaChartConfiguration {
  title = "";
}

export const basicAreaChartConfigurationSchema = z.object({
  title: z.string(),
}) satisfies z.ZodType<BasicAreaChartConfiguration>;
