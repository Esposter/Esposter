import type { ToData } from "#shared/models/entity/ToData";
import type { Type } from "arktype";

import {
  BasicChartConfiguration,
  basicChartConfigurationSchema,
} from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import { ChartType, chartTypeSchema } from "#shared/models/dashboard/data/chart/type/ChartType";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { type } from "arktype";

export class Chart extends AItemEntity {
  configuration = new BasicChartConfiguration();
  type: ChartType = ChartType.Basic;
}

export const chartSchema = aItemEntitySchema.merge(
  type({
    configuration: basicChartConfigurationSchema,
    type: chartTypeSchema,
  }),
) satisfies Type<ToData<Chart>>;
