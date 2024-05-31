import type { DataLabelsLineChartConfiguration } from "@/models/dashboard/chart/line/configuration/DataLabelsLineChartConfiguration";
import { BaseChartConfigurationResolver } from "@/models/resolvers/dashboard/chart/BaseChartConfigurationResolver";
import type { ApexOptions } from "apexcharts";

export class DataLabelsLineChartConfigurationResolver extends BaseChartConfigurationResolver<DataLabelsLineChartConfiguration> {
  handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.dataLabels = {
      enabled: true,
    };
    return apexOptions;
  }
}
