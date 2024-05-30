import type { BasicAreaChartConfiguration } from "@/models/dashboard/chart/area/configuration/BasicAreaChartConfiguration";
import { AChartConfigurationResolver } from "@/models/resolvers/dashboard/AChartConfigurationResolver";
import type { ApexOptions } from "apexcharts";

export class BasicAreaChartConfigurationResolver extends AChartConfigurationResolver<BasicAreaChartConfiguration> {
  handleConfiguration(apexOptions: ApexOptions, { title, subtitle }: BasicAreaChartConfiguration) {
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
