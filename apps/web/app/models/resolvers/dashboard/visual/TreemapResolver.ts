import type { ApexOptions } from "apexcharts";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { AVisualTypeResolver } from "#src/models/resolvers/dashboard/visual/AVisualTypeResolver";
import { defu } from "defu";

export class TreemapResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.Treemap);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.legend = defu({ show: false }, apexOptions.legend);
  }
}
