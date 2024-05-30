import type { BasicAreaChartConfiguration } from "@/models/dashboard/chart/area/configuration/BasicAreaChartConfiguration";
import type { BasicLineChartConfiguration } from "@/models/dashboard/chart/line/configuration/BasicLineChartConfiguration";
import { AChartConfigurationResolver } from "@/models/resolvers/dashboard/AChartConfigurationResolver";
import type { ApexOptions } from "apexcharts";

export class BasicLineChartConfigurationResolver extends AChartConfigurationResolver<BasicLineChartConfiguration> {
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
