import type { ToData } from "@esposter/shared";

import { Serializable } from "@esposter/shared";
import { z } from "zod";

export class BasicChartConfiguration extends Serializable {
  dataLabels?: boolean;
  subtitle?: string;
  title?: string;
}

export const basicChartConfigurationSchema = z.object({
  dataLabels: z.boolean().default(false),
  subtitle: z.string().default(""),
  title: z.string().default(""),
}) satisfies z.ZodType<ToData<BasicChartConfiguration>>;
