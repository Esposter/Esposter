import type { ToData } from "#shared/models/entity/ToData";

import {
  BasicChartConfiguration,
  basicChartConfigurationSchema,
} from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import { ChartType, chartTypeSchema } from "#shared/models/dashboard/data/chart/type/ChartType";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { z } from "zod";

export class Chart extends AItemEntity {
  configuration = new BasicChartConfiguration();
  type: ChartType = ChartType.Basic;
}

export const chartSchema = aItemEntitySchema.extend(
  z.object({
    configuration: basicChartConfigurationSchema,
    type: chartTypeSchema,
  }),
) satisfies z.ZodType<ToData<Chart>>;
