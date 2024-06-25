import { VisualType } from "@/models/dashboard/VisualType";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import { uncapitalize } from "@/util/text/uncapitalize";
import type { ApexOptions } from "apexcharts";
import defu from "defu";

export class ColumnResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.Column);
  }

  handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.chart = defu(
      {
        type: uncapitalize(VisualType.Bar),
      },
      apexOptions.chart,
    );
  }
}
