import type { BasicAreaChartConfiguration } from "@/models/dashboard/chart/area/configuration/BasicAreaChartConfiguration";
import type { BasicColumnChartConfiguration } from "@/models/dashboard/chart/column/configuration/BasicColumnChartConfiguration";
import { BaseChartConfigurationResolver } from "@/models/resolvers/dashboard/chart/BaseChartConfigurationResolver";
import type { ApexOptions } from "apexcharts";

export class BasicColumnChartConfigurationResolver extends BaseChartConfigurationResolver<BasicColumnChartConfiguration> {
  handleConfiguration(apexOptions: ApexOptions, { subtitle }: BasicAreaChartConfiguration) {
    apexOptions.subtitle = {
      text: subtitle,
      align: "left",
    };
    return apexOptions;
  }
}
