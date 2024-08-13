import type { ApexOptions } from "apexcharts";

import { VisualType } from "@/models/dashboard/VisualType";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import defu from "defu";

export class ScatterResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.Scatter);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.chart = defu<ApexChart, (ApexChart | undefined)[]>(
      {
        enabled: true,
        type: "xy",
      },
      apexOptions.chart,
    );
  }
}
