import type { BasicAreaChartConfiguration } from "@/models/dashboard/chart/area/configuration/BasicAreaChartConfiguration";
import { BaseChartConfigurationResolver } from "@/models/resolvers/dashboard/chart/BaseChartConfigurationResolver";
import type { ApexOptions } from "apexcharts";

export class BasicAreaChartConfigurationResolver extends BaseChartConfigurationResolver<BasicAreaChartConfiguration> {
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
