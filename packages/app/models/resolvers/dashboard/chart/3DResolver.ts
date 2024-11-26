import type { BasicChartConfiguration } from "@/shared/models/dashboard/data/chart/BasicChartConfiguration";
import type { ApexOptions } from "apexcharts";

import { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";
import { ChartType } from "@/shared/models/dashboard/data/chart/type/ChartType";
import { defu } from "defu";

export class ChartType3DResolver<T extends BasicChartConfiguration> extends AChartTypeResolver<T> {
  constructor() {
    super(ChartType["3D"]);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.fill = defu(
      {
        type: "gradient",
      },
      apexOptions.fill,
    );
    apexOptions.theme = defu(
      {
        palette: "palette2",
      },
      apexOptions.theme,
    );
  }
}
