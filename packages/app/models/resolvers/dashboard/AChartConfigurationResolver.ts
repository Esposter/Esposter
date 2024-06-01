import type { Chart } from "@/models/dashboard/chart/Chart";
import type { ApexOptions } from "apexcharts";

export abstract class AChartConfigurationResolver<T extends Chart["configuration"]> {
  handleBaseConfiguration(apexOptions: ApexOptions, _configuration: T): ApexOptions {
    return apexOptions;
  }

  handleConfiguration(apexOptions: ApexOptions, _configuration: T): ApexOptions {
    return apexOptions;
  }
}
