import type { Chart } from "@/models/dashboard/chart/Chart";
import type { ApexOptions } from "apexcharts";

export abstract class AChartConfigurationResolver<T extends Chart["configuration"]> {
  handleConfiguration(_apexOptions: ApexOptions, _configuration: T): ApexOptions {
    return _apexOptions;
  }
}
