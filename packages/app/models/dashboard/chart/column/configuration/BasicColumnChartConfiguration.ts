import { z } from "zod";

export class BasicColumnChartConfiguration {
  title = "";
}

export const basicColumnChartConfigurationSchema = z.object({
  title: z.string(),
}) satisfies z.ZodType<BasicColumnChartConfiguration>;
