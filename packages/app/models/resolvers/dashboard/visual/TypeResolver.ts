import type { VisualType } from "@/models/dashboard/VisualType";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import { uncapitalize } from "@/util/text/uncapitalize";
import type { ApexOptions } from "apexcharts";
import { defu } from "defu";

export class TypeResolver extends AVisualTypeResolver {
  override isActive() {
    return true;
  }

  override handleConfiguration(apexOptions: ApexOptions, type: VisualType) {
    apexOptions.chart = defu(
      {
        type: uncapitalize(type) as ApexChart["type"],
      },
      apexOptions.chart,
    );
  }
}
