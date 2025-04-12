import type { Chart } from "#shared/models/dashboard/data/chart/Chart";
import type { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import type { ApexOptions } from "apexcharts";
import type { Type } from "arktype";

export abstract class AChartTypeResolver<T extends Chart["configuration"]> {
  type: ChartType;

  constructor(type: ChartType) {
    this.type = type;
  }

  handleConfiguration(_apexOptions: ApexOptions, _configuration: T) {}

  handleSchema(schema: Type<object>) {
    return schema;
  }

  isActive(type: ChartType) {
    return type === this.type;
  }
}
