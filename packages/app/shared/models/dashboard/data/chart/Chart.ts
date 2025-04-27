import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { ToData } from "#shared/models/entity/ToData";

import {
  BasicChartConfiguration,
  basicChartConfigurationSchema,
} from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import { ChartType, chartTypeSchema } from "#shared/models/dashboard/data/chart/type/ChartType";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { createItemEntityTypeSchema } from "#shared/models/entity/ItemEntityType";
import { z } from "zod";

export class Chart extends AItemEntity implements ItemEntityType<ChartType> {
  configuration = new BasicChartConfiguration();
  type: ChartType = ChartType.Basic;
}

export const chartSchema = aItemEntitySchema.extend(createItemEntityTypeSchema(chartTypeSchema)).extend(
  z.interface({
    configuration: basicChartConfigurationSchema,
  }),
) satisfies z.ZodType<ToData<Chart>>;
