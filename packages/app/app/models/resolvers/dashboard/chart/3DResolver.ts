import type { BasicChartConfiguration } from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import type { ApexOptions } from "apexcharts";

import { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";

export class ChartType3DResolver<T extends BasicChartConfiguration> extends AChartTypeResolver<T> {
  constructor() {
    super(ChartType["3D"]);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.fill = defuReplaceArray(
      {
        type: "gradient",
      },
      apexOptions.fill,
    );
    apexOptions.theme = defuReplaceArray(
      {
        palette: "palette2",
      },
      apexOptions.theme,
    );
  }
}
