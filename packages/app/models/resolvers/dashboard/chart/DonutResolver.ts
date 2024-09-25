import type { BasicChartConfiguration } from "@/models/dashboard/chart/BasicChartConfiguration";
import type { ApexOptions } from "apexcharts";

import { ChartType } from "@/models/dashboard/chart/type/ChartType";
import { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";
import { uncapitalize } from "@/util/text/uncapitalize";
import { defu } from "defu";

export class DonutResolver<T extends BasicChartConfiguration> extends AChartTypeResolver<T> {
  constructor() {
    super(ChartType.Donut);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.chart = defu(
      {
        type: uncapitalize(ChartType.Donut),
      },
      apexOptions.chart,
    );
  }
}
