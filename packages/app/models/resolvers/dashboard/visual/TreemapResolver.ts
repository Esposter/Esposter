import type { ApexOptions } from "apexcharts";

import { VisualType } from "@/models/dashboard/VisualType";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import defu from "defu";

export class TreemapResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.Treemap);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.legend = defu(
      {
        show: false,
      },
      apexOptions.legend,
    );
  }
}
