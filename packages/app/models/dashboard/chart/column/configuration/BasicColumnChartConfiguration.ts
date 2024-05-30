import { z } from "zod";

export class BasicColumnChartConfiguration {
  title = "";
  subtitle = "";
}

export const basicColumnChartConfigurationSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
}) satisfies z.ZodType<BasicColumnChartConfiguration>;
