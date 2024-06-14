import { VisualType } from "@/models/dashboard/VisualType";
import { basicChartConfigurationSchema } from "@/models/dashboard/chart/BasicChartConfiguration";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import type { ApexOptions } from "apexcharts";
import defu from "defu";
import type { z } from "zod";

export class FunnelResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.Funnel);
  }

  handleConfiguration(apexOptions: ApexOptions) {
    apexOptions.dataLabels = defu<ApexDataLabels, (ApexDataLabels | undefined)[]>(
      {
        enabled: true,
        formatter: (_val, opts) => opts.w.globals.labels[opts.dataPointIndex],
        dropShadow: {
          enabled: true,
        },
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
          borderRadius: 0,
          horizontal: true,
          barHeight: "80%",
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

  handleSchema(schema: z.AnyZodObject) {
    return schema.omit({ [basicChartConfigurationSchema.keyof().Values.dataLabels]: true });
  }
}
