import type { ApexOptions } from "apexcharts";

import { VisualType } from "@/models/dashboard/VisualType";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import { uncapitalize } from "@/util/text/uncapitalize";
import defu from "defu";

export class SlopeResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.Slope);
  }

  handleConfiguration(apexOptions: ApexOptions) {
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
