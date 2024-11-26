import type { BasicChartConfiguration } from "@/shared/models/dashboard/data/chart/BasicChartConfiguration";
import type { ApexOptions } from "apexcharts";

import { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";
import { ChartType } from "@/shared/models/dashboard/data/chart/type/ChartType";
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
