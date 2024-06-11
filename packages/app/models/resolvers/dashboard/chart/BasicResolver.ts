import { VisualType } from "@/models/dashboard/VisualType";
import type { BasicChartConfiguration } from "@/models/dashboard/chart/BasicChartConfiguration";
import { basicChartConfigurationSchema } from "@/models/dashboard/chart/BasicChartConfiguration";
import { ChartType } from "@/models/dashboard/chart/ChartType";
import { AChartFeatureResolver } from "@/models/resolvers/dashboard/chart/AChartFeatureResolver";
import { NotInitializedError } from "@esposter/shared";
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
    if (!apexOptions.chart) throw new NotInitializedError(this.handleConfiguration.name);

    apexOptions.dataLabels = {
      enabled: false,
    };
    apexOptions.subtitle = {
      text: subtitle,
    };
    apexOptions.title = {
      text: title,
    };
    apexOptions.chart.zoom = {
      enabled: false,
    };
    if (visualType === VisualType.Funnel) {
      apexOptions.dataLabels = {
        enabled: true,
        formatter: (_val, opts) => opts.w.globals.labels[opts.dataPointIndex],
        dropShadow: {
          enabled: true,
        },
      };
      apexOptions.legend = {
        show: false,
      };
      if (apexOptions.plotOptions?.bar) {
        apexOptions.plotOptions.bar.borderRadius = 0;
        apexOptions.plotOptions.bar.horizontal = true;
        apexOptions.plotOptions.bar.barHeight = "80%";
        apexOptions.plotOptions.bar.isFunnel = true;
      } else
        apexOptions.plotOptions = {
          bar: {
            borderRadius: 0,
            horizontal: true,
            barHeight: "80%",
            isFunnel: true,
          },
        };
      apexOptions.subtitle.align = "center";
      apexOptions.title.align = "center";
    }
    if (visualType === VisualType.Scatter)
      apexOptions.chart.zoom = {
        enabled: true,
        type: "xy",
      };
  }

  handleSchema(schema: z.AnyZodObject) {
    return schema.merge(basicChartConfigurationSchema);
  }
}
