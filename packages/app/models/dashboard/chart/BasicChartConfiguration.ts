import { z } from "zod";

export class BasicChartConfiguration {
  title? = "";
  subtitle? = "";
}

export const basicChartConfigurationSchema = z.object({
  title: z.string().default(""),
  subtitle: z.string().default(""),
}) satisfies z.ZodType<BasicChartConfiguration>;
