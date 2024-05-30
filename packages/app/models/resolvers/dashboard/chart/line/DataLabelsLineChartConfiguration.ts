import type { DataLabelsLineChartConfiguration } from "@/models/dashboard/chart/line/configuration/DataLabelsLineChartConfiguration";
import { AChartConfigurationResolver } from "@/models/resolvers/dashboard/AChartConfigurationResolver";
import type { ApexOptions } from "apexcharts";

export class DataLabelsLineChartConfigurationResolver extends AChartConfigurationResolver<DataLabelsLineChartConfiguration> {
  handleConfiguration(apexOptions: ApexOptions, { title }: DataLabelsLineChartConfiguration) {
    apexOptions.dataLabels = {
      enabled: true,
    };
    apexOptions.title = {
      text: title,
      align: "left",
    };
    return apexOptions;
  }
}
