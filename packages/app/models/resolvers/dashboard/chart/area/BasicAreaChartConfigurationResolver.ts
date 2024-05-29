import type { BasicAreaChartConfiguration } from "@/models/dashboard/chart/area/BasicAreaChartConfiguration";
import { AChartConfigurationResolver } from "@/models/resolvers/dashboard/AChartConfigurationResolver";
import type { ApexOptions } from "apexcharts";

export class BasicAreaChartConfigurationResolver extends AChartConfigurationResolver<BasicAreaChartConfiguration> {
  handleConfiguration(apexOptions: ApexOptions, { configuration: { title } }: BasicAreaChartConfiguration) {
    apexOptions.title = {
      text: title,
      align: "left",
    };
    return apexOptions;
  }
}
