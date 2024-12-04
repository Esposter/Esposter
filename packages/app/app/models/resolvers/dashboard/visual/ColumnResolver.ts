import type { ApexOptions } from "apexcharts";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import { uncapitalize } from "@/util/text/uncapitalize";
import defu from "defu";

export class ColumnResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.Column);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.chart = defu(
      {
        type: uncapitalize(VisualType.Bar),
      },
      apexOptions.chart,
    );
  }
}
