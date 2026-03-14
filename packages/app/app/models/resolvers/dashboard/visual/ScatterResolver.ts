import type { ApexOptions } from "apexcharts";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import { defu } from "defu";

export class ScatterResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.Scatter);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.chart = defu<NonNullable<ApexOptions["chart"]>, ApexOptions["chart"][]>(
      {
        zoom: {
          enabled: true,
          type: "xy",
        },
      },
      apexOptions.chart,
    );
  }
}
