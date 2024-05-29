import type { BasicLineChartConfiguration } from "@/models/dashboard/chart/line/BasicLineChartConfiguration";
import { AChartConfigurationResolver } from "@/models/resolvers/dashboard/AChartConfigurationResolver";
import type { ApexOptions } from "apexcharts";

export class BasicLineChartConfigurationResolver extends AChartConfigurationResolver<BasicLineChartConfiguration> {
  handleConfiguration(apexOptions: ApexOptions, { configuration: { title } }: BasicLineChartConfiguration) {
    apexOptions.title = {
      text: title,
      align: "left",
    };
    return apexOptions;
  }
}
