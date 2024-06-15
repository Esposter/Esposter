import { VisualType } from "@/models/dashboard/VisualType";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import type { ApexOptions } from "apexcharts";
import defu from "defu";

export class SlopeResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.Slope);
  }

  handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.plotOptions = defu(
      {
        line: {
          isSlopeChart: true
        }
      },
      apexOptions.plotOptions,
    );
  }
}
