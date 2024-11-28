import type { BasicChartConfiguration } from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import type { ApexOptions } from "apexcharts";
import type { z } from "zod";

import { basicChartConfigurationSchema } from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";
import { defu } from "defu";

export class BasicResolver<T extends BasicChartConfiguration> extends AChartTypeResolver<T> {
  constructor() {
    super(ChartType.Basic);
  }

  override handleConfiguration(apexOptions: ApexOptions, { dataLabels, subtitle, title }: T) {
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

  override handleSchema(schema: z.AnyZodObject) {
    return schema.merge(basicChartConfigurationSchema);
  }

  // This is our base resolver that's always active
  override isActive() {
    return true;
  }
}
