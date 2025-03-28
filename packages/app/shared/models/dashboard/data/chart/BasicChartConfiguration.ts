import { z } from "zod";

export class BasicChartConfiguration {
  dataLabels?: boolean;
  subtitle?: string;
  title?: string;
}

export const basicChartConfigurationSchema = z.object({
  dataLabels: z.boolean().default(false),
  subtitle: z.string().default(""),
  title: z.string().default(""),
}) satisfies z.ZodType<BasicChartConfiguration>;
