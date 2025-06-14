import type { ApexOptions } from "apexcharts";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import { uncapitalize } from "@/util/text/uncapitalize";

export class SlopeResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.Slope);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.chart = defuReplaceArray(
      {
        type: uncapitalize(VisualType.Line),
      },
      apexOptions.chart,
    );
    apexOptions.plotOptions = defuReplaceArray(
      {
        line: {
          isSlopeChart: true,
        },
      },
      apexOptions.plotOptions,
    );
  }
}
