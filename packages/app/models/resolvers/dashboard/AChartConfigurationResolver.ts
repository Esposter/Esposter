import type { Visual } from "@/models/dashboard/Visual";
import type { ApexOptions } from "apexcharts";

export abstract class AChartConfigurationResolver<T extends Visual["configuration"]> {
  handleConfiguration(_apexOptions: ApexOptions, _configuration: T): ApexOptions {
    return _apexOptions;
  }
}
