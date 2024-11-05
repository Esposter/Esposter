import type { BasicChartConfiguration } from "@/models/dashboard/chart/BasicChartConfiguration";
import type { ApexOptions } from "apexcharts";

import { ChartType } from "@/models/dashboard/chart/type/ChartType";
import { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";
import { defu } from "defu";

export class DistributedResolver<T extends BasicChartConfiguration> extends AChartTypeResolver<T> {
  constructor() {
    super(ChartType.Distributed);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.plotOptions = defu(
      {
        treemap: {
          distributed: true,
          enableShades: false,
        },
      },
      apexOptions.plotOptions,
    );
  }
}
