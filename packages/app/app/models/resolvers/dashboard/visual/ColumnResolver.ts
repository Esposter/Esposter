import type { ApexOptions } from "apexcharts";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import { uncapitalize } from "@/util/text/uncapitalize";

export class ColumnResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.Column);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.chart = defuReplaceArray(
      {
        type: uncapitalize(VisualType.Bar),
      },
      apexOptions.chart,
    );
  }
}
