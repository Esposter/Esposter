import type { ItemEntityType, ToData } from "@esposter/shared";

import {
  BasicChartConfiguration,
  basicChartConfigurationSchema,
} from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import { ChartType, chartTypeSchema } from "#shared/models/dashboard/data/chart/type/ChartType";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export class Chart extends AItemEntity implements ItemEntityType<ChartType> {
  configuration = new BasicChartConfiguration();
  type: ChartType = ChartType.Basic;
}

export const chartSchema = z.object({
  ...aItemEntitySchema.shape,
  ...createItemEntityTypeSchema(chartTypeSchema).shape,
  configuration: basicChartConfigurationSchema,
}) satisfies z.ZodType<ToData<Chart>>;
