import type { BasicChartConfiguration } from "@/models/dashboard/chart/BasicChartConfiguration";
import { ChartType } from "@/models/dashboard/chart/ChartType";
import { AChartFeatureResolver } from "@/models/resolvers/dashboard/chart/AChartFeatureResolver";
import type { ApexOptions } from "apexcharts";

export class DataLabelsResolver<T extends BasicChartConfiguration> extends AChartFeatureResolver<T> {
  constructor() {
    super(ChartType.DataLabels);
  }

  handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.dataLabels = {
      enabled: true,
    };
  }
}
