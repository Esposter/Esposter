import type { Chart } from "#shared/models/dashboard/data/chart/Chart";
import type { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { ApexOptions } from "apexcharts";
import type { z } from "zod/v4";

export abstract class AChartTypeResolver<T extends Chart["configuration"]> implements ItemEntityType<ChartType> {
  type;

  constructor(type: ChartType) {
    this.type = type;
  }

  handleConfiguration(_apexOptions: ApexOptions, _configuration: T) {}

  handleSchema(schema: z.ZodObject): z.ZodObject {
    return schema;
  }

  isActive(type: ChartType) {
    return type === this.type;
  }
}
