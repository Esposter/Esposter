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

  handleConfiguration(apexOptions: ApexOptions, { title, subtitle, dataLabels }: T) {
    apexOptions.chart = defu(
      {
        zoom: {
          enabled: false,
        },
      },
      apexOptions.chart,
    );
    apexOptions.dataLabels = defu(
      {
        enabled: dataLabels,
      },
      apexOptions.dataLabels,
    );
    apexOptions.subtitle = defu(
      {
        text: subtitle,
      },
      apexOptions.subtitle,
    );
    apexOptions.title = defu(
      {
        text: title,
      },
      apexOptions.title,
    );
  }

  handleSchema(schema: z.AnyZodObject) {
    return schema.merge(basicChartConfigurationSchema);
  }
}
