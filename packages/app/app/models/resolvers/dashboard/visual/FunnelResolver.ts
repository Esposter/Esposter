import type { ApexOptions } from "apexcharts";
import type { z } from "zod";

import { basicChartConfigurationSchema } from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import { uncapitalize } from "@/util/text/uncapitalize";
import defu from "defu";

export class FunnelResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.Funnel);
  }

  override handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.chart = defu(
      {
        type: uncapitalize(VisualType.Bar),
      },
      apexOptions.chart,
    );
    apexOptions.dataLabels = defu<ApexDataLabels, (ApexDataLabels | undefined)[]>(
      {
        dropShadow: {
          enabled: true,
        },
        enabled: true,
        formatter: (_val, opts) => opts.w.globals.labels[opts.dataPointIndex],
      },
      apexOptions.dataLabels,
    );
    apexOptions.legend = defu(
      {
        show: false,
      },
      apexOptions.legend,
    );
    apexOptions.plotOptions = defu(
      {
        bar: {
          barHeight: "80%",
          borderRadius: 0,
          horizontal: true,
          isFunnel: true,
        },
      },
      apexOptions.plotOptions,
    );
    apexOptions.subtitle = defu<ApexTitleSubtitle, (ApexTitleSubtitle | undefined)[]>(
      {
        align: "center",
      },
      apexOptions.subtitle,
    );
    apexOptions.title = defu<ApexTitleSubtitle, (ApexTitleSubtitle | undefined)[]>(
      {
        align: "center",
      },
      apexOptions.title,
    );
  }

  override handleSchema(schema: z.ZodObject) {
    return schema.omit({ [basicChartConfigurationSchema.keyof().enum.dataLabels]: true });
  }
}
