import type { BasicAreaChartConfiguration } from "@/models/dashboard/chart/area/configuration/BasicAreaChartConfiguration";
import { AChartConfigurationResolver } from "@/models/resolvers/dashboard/AChartConfigurationResolver";
import type { ApexOptions } from "apexcharts";

export class BasicAreaChartConfigurationResolver extends AChartConfigurationResolver<BasicAreaChartConfiguration> {
  handleConfiguration(apexOptions: ApexOptions, { title }: BasicAreaChartConfiguration) {
    apexOptions.title = {
      text: title,
      align: "left",
    };
    return apexOptions;
  }
}
