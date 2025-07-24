import type { BasicChartConfiguration } from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import type { ApexOptions } from "apexcharts";

import { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";
import { defu } from "defu";

export class PyramidResolver<T extends BasicChartConfiguration> extends AChartTypeResolver<T> {
  constructor() {
    super(ChartType.Pyramid);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.plotOptions = defu(
      {
        bar: {
          distributed: true,
        },
      },
      apexOptions.plotOptions,
    );
  }
}
