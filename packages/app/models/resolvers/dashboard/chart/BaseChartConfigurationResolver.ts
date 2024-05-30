import type { BaseChartConfiguration } from "@/models/dashboard/chart/BaseChartConfiguration";
import { AChartConfigurationResolver } from "@/models/resolvers/dashboard/AChartConfigurationResolver";
import type { ApexOptions } from "apexcharts";

export class BaseChartConfigurationResolver<T extends BaseChartConfiguration> extends AChartConfigurationResolver<T> {
  handleConfiguration(apexOptions: ApexOptions, { title }: T) {
    apexOptions.title = {
      text: title,
      align: "left",
    };
    return apexOptions;
  }
}
