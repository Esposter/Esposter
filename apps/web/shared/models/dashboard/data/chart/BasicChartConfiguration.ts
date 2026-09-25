import type { ToData } from "@esposter/shared";

import { ITEM_NAME_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { Serializable } from "@esposter/shared";
import { z } from "zod";

export class BasicChartConfiguration extends Serializable {
  dataLabels = false;
  subtitle = "";
  title = "";
}

export const basicChartConfigurationSchema = z.object({
  dataLabels: z.boolean().default(false),
  subtitle: z.string().max(ITEM_NAME_MAX_LENGTH).default(""),
  title: z.string().max(ITEM_NAME_MAX_LENGTH).default(""),
}) satisfies z.ZodType<ToData<BasicChartConfiguration>>;
