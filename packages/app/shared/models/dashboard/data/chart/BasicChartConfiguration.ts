import type { ToData } from "#shared/models/entity/ToData";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { z } from "zod";

export class BasicChartConfiguration extends AItemEntity {
  dataLabels?: boolean;
  subtitle?: string;
  title?: string;
}

export const basicChartConfigurationSchema = z
  .object({
    dataLabels: z.boolean().default(false),
    subtitle: z.string().default(""),
    title: z.string().default(""),
  })
  .merge(aItemEntitySchema) satisfies z.ZodType<ToData<BasicChartConfiguration>>;
