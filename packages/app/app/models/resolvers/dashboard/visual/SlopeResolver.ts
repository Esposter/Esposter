import type { ApexOptions } from "apexcharts";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import { uncapitalize } from "@esposter/shared";
import { defu } from "defu";

export class SlopeResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.Slope);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.chart = defu(
      {
        type: uncapitalize(VisualType.Line),
      },
      apexOptions.chart,
    );
    apexOptions.plotOptions = defu(
      {
        line: {
          isSlopeChart: true,
        },
      },
      apexOptions.plotOptions,
    );
  }
}
