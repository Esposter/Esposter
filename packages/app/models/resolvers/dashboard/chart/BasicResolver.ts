import { VisualType } from "@/models/dashboard/VisualType";
import type { BasicChartConfiguration } from "@/models/dashboard/chart/BasicChartConfiguration";
import { basicChartConfigurationSchema } from "@/models/dashboard/chart/BasicChartConfiguration";
import { ChartType } from "@/models/dashboard/chart/type/ChartType";
import { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";
import type { ApexOptions } from "apexcharts";
import { defu } from "defu";
import type { z } from "zod";

export class BasicResolver<T extends BasicChartConfiguration> extends AChartTypeResolver<T> {
  constructor() {
    super(ChartType.Basic);
  }
  // This is our base resolver that's always active
  isActive() {
    return true;
  }

  handleConfiguration(apexOptions: ApexOptions, { title, subtitle }: T, visualType: VisualType) {
    apexOptions.dataLabels = {
      enabled: false,
    };
    apexOptions.subtitle = {
      text: subtitle,
    };
    apexOptions.title = {
      text: title,
    };
    apexOptions.chart = defu(
      {
        zoom: {
          enabled: false,
        },
      },
      apexOptions.chart,
    );

    switch (visualType) {
      case VisualType.Funnel:
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
        apexOptions.plotOptions = defu(
          {
            bar: {
              borderRadius: 0,
              horizontal: true,
              barHeight: "80%",
              isFunnel: true,
            },
          },
          apexOptions.plotOptions,
        );
        apexOptions.subtitle.align = "center";
        apexOptions.title.align = "center";
        break;
      case VisualType.Scatter:
        apexOptions.chart.zoom = {
          enabled: true,
          type: "xy",
        };
        break;
      case VisualType.Treemap:
        apexOptions.legend = {
          show: false,
        };
        break;
      default:
        break;
    }
  }

  handleSchema(schema: z.AnyZodObject) {
    return schema.merge(basicChartConfigurationSchema);
  }
}
