import type { BaseChartConfiguration } from "@/models/dashboard/chart/BaseChartConfiguration";
import { AChartConfigurationResolver } from "@/models/resolvers/dashboard/AChartConfigurationResolver";
import type { ApexOptions } from "apexcharts";

export class BaseChartConfigurationResolver<T extends BaseChartConfiguration> extends AChartConfigurationResolver<T> {
  handleBaseConfiguration(apexOptions: ApexOptions, { title, subtitle }: T) {
    apexOptions.dataLabels = {
      enabled: false,
    };
    apexOptions.title = {
      text: title,
      align: "left",
    };
    apexOptions.subtitle = {
      text: subtitle,
      align: "left",
    };
    return apexOptions;
  }
}
