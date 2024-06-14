import { z } from "zod";

export class BasicChartConfiguration {
  title? = "";
  subtitle? = "";
  dataLabels? = false;
}

export const basicChartConfigurationSchema = z.object({
  title: z.string().default(""),
  subtitle: z.string().default(""),
  dataLabels: z.boolean().default(false),
}) satisfies z.ZodType<BasicChartConfiguration>;
