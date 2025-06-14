import type { VisualType } from "#shared/models/dashboard/data/VisualType";
import type { ApexOptions } from "apexcharts";

import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import { uncapitalize } from "@/util/text/uncapitalize";

export class TypeResolver extends AVisualTypeResolver {
  override handleConfiguration(apexOptions: ApexOptions, type: VisualType) {
    apexOptions.chart = defuReplaceArray(
      {
        type: uncapitalize(type) as ApexChart["type"],
      },
      apexOptions.chart,
    );
  }

  override isActive() {
    return true;
  }
}
