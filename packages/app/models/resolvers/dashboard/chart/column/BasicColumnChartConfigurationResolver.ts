import type { BasicAreaChartConfiguration } from "@/models/dashboard/chart/area/configuration/BasicAreaChartConfiguration";
import type { BasicColumnChartConfiguration } from "@/models/dashboard/chart/column/configuration/BasicColumnChartConfiguration";
import { AChartConfigurationResolver } from "@/models/resolvers/dashboard/AChartConfigurationResolver";
import type { ApexOptions } from "apexcharts";

export class BasicColumnChartConfigurationResolver extends AChartConfigurationResolver<BasicColumnChartConfiguration> {
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
