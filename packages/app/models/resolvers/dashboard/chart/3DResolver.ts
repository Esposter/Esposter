import type { BasicChartConfiguration } from "@/models/dashboard/chart/BasicChartConfiguration";
import { ChartType } from "@/models/dashboard/chart/type/ChartType";
import { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";
import type { ApexOptions } from "apexcharts";
import { defu } from "defu";

export class ChartType3DResolver<T extends BasicChartConfiguration> extends AChartTypeResolver<T> {
  constructor() {
    super(ChartType["3D"]);
  }

  handleConfiguration(apexOptions: ApexOptions) {
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
