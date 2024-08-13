import type { Chart } from "@/models/dashboard/chart/Chart";
import type { ChartType } from "@/models/dashboard/chart/type/ChartType";
import type { ApexOptions } from "apexcharts";
import type { z } from "zod";

export abstract class AChartTypeResolver<T extends Chart["configuration"]> {
  type: ChartType;

  constructor(type: ChartType) {
    this.type = type;
  }

  handleConfiguration(_apexOptions: ApexOptions, _configuration: T) {}

  handleSchema(schema: z.AnyZodObject): z.AnyZodObject {
    return schema;
  }

  isActive(type: ChartType) {
    return type === this.type;
  }
}
