import { VisualType } from "@/models/dashboard/VisualType";
import type { BasicChartConfiguration } from "@/models/dashboard/chart/BasicChartConfiguration";
import { basicChartConfigurationSchema } from "@/models/dashboard/chart/BasicChartConfiguration";
import { ChartType } from "@/models/dashboard/chart/ChartType";
import { AChartFeatureResolver } from "@/models/resolvers/dashboard/chart/AChartFeatureResolver";
import type { ApexOptions } from "apexcharts";
import type { z } from "zod";

export class BasicResolver<T extends BasicChartConfiguration> extends AChartFeatureResolver<T> {
  constructor() {
    super(ChartType.Basic);
  }
  // This is our base resolver that's always active
  isActive() {
    return true;
  }

  handleConfiguration(apexOptions: ApexOptions, { title, subtitle }: T, visualType: VisualType) {
    apexOptions.title = {
      text: title,
      align: "left",
    };
    apexOptions.subtitle = {
      text: subtitle,
      align: "left",
    };
    if (visualType === VisualType.Funnel)
      apexOptions.dataLabels = {
        enabled: true,
        formatter: (_val, opts) => opts.w.globals.labels[opts.dataPointIndex],
        dropShadow: {
          enabled: true,
        },
      };
    else
      apexOptions.dataLabels = {
        enabled: false,
      };
  }

  handleSchema(schema: z.AnyZodObject) {
    return schema.merge(basicChartConfigurationSchema);
  }
}
