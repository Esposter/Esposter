import type { BasicChartConfiguration } from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import type { ApexOptions } from "apexcharts";

import { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";

export class DistributedResolver<T extends BasicChartConfiguration> extends AChartTypeResolver<T> {
  constructor() {
    super(ChartType.Distributed);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.plotOptions = defuReplaceArray(
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
