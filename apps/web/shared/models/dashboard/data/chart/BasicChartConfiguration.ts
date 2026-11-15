import type { ToData } from "@esposter/shared";

import { Serializable } from "#shared/models/shared/Serializable";
import { ITEM_NAME_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { z } from "zod";

export class BasicChartConfiguration extends Serializable {
  dataLabels = false;
  subtitle = "";
  title = "";

  constructor(init?: Partial<BasicChartConfiguration>) {
    super();
    Object.assign(this, init);
  }
}

export const basicChartConfigurationSchema = z.object({
  dataLabels: z.boolean(),
  subtitle: z.string().max(ITEM_NAME_MAX_LENGTH),
  title: z.string().max(ITEM_NAME_MAX_LENGTH),
}) satisfies z.ZodType<ToData<BasicChartConfiguration>>;
