import { z } from "zod";

export class BasicChartConfiguration {
  title?: string;
  subtitle?: string;
  dataLabels?: boolean;
}

export const basicChartConfigurationSchema = z.object({
  title: z.string().default(""),
  subtitle: z.string().default(""),
  dataLabels: z.boolean().default(false),
}) satisfies z.ZodType<BasicChartConfiguration>;
