import type { VisualType } from "@/models/dashboard/VisualType";
import type { Chart } from "@/models/dashboard/chart/Chart";
import type { ChartType } from "@/models/dashboard/chart/ChartType";
import type { ApexOptions } from "apexcharts";
import type { z } from "zod";

export abstract class AChartFeatureResolver<T extends Chart["configuration"]> {
  type: ChartType;

  constructor(type: ChartType) {
    this.type = type;
  }

  isActive(type: ChartType) {
    return type === this.type;
  }

  handleConfiguration(_apexOptions: ApexOptions, _configuration: T, _visualType: VisualType) {}

  handleSchema(schema: z.AnyZodObject): z.AnyZodObject {
    return schema;
  }
}
