import type { BasicChartConfiguration } from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import type { ApexOptions } from "apexcharts";

import { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";
import { uncapitalize } from "@/util/text/uncapitalize";

export class DonutResolver<T extends BasicChartConfiguration> extends AChartTypeResolver<T> {
  constructor() {
    super(ChartType.Donut);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.chart = defuReplaceArray(
      {
        type: uncapitalize(ChartType.Donut),
      },
      apexOptions.chart,
    );
  }
}
