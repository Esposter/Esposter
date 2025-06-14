import type { ApexOptions } from "apexcharts";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";

export class TreemapResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.Treemap);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.legend = defuReplaceArray(
      {
        show: false,
      },
      apexOptions.legend,
    );
  }
}
