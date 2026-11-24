import type { VisualType } from "#shared/models/dashboard/data/VisualType";
import type { ApexOptions } from "apexcharts";

import { AVisualTypeResolver } from "#src/models/resolvers/dashboard/visual/AVisualTypeResolver";
import { uncapitalize } from "@esposter/shared";
import { defu } from "defu";

export class TypeResolver extends AVisualTypeResolver {
  override checkIsActive() {
    return true;
  }

  override handleConfiguration(apexOptions: ApexOptions, type: VisualType) {
    apexOptions.chart = defu(
      /* oxlint-disable-next-line typescript/no-unsafe-type-assertion -- an uncapitalized VisualType is the name of an
         ApexCharts chart type for the visuals apex draws, a string the compiler cannot relate to ApexCharts' union */
      { type: uncapitalize(type) as NonNullable<NonNullable<ApexOptions["chart"]>["type"]> },
      apexOptions.chart,
    );
  }
}
