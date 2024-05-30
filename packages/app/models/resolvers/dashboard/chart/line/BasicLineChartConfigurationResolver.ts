import type { BasicAreaChartConfiguration } from "@/models/dashboard/chart/area/configuration/BasicAreaChartConfiguration";
import type { BasicLineChartConfiguration } from "@/models/dashboard/chart/line/configuration/BasicLineChartConfiguration";
import { BaseChartConfigurationResolver } from "@/models/resolvers/dashboard/chart/BaseChartConfigurationResolver";
import type { ApexOptions } from "apexcharts";

export class BasicLineChartConfigurationResolver extends BaseChartConfigurationResolver<BasicLineChartConfiguration> {
  handleConfiguration(apexOptions: ApexOptions, configuration: BasicAreaChartConfiguration) {
    super.handleConfiguration(apexOptions, configuration);
    const { subtitle } = configuration;
    apexOptions.subtitle = {
      text: subtitle,
      align: "left",
    };
    return apexOptions;
  }
}
