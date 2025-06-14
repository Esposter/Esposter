import type { BasicChartConfiguration } from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import type { ApexOptions } from "apexcharts";

import { basicChartConfigurationSchema } from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";
import { z } from "zod/v4";

export class BasicResolver<T extends BasicChartConfiguration> extends AChartTypeResolver<T> {
  constructor() {
    super(ChartType.Basic);
  }

  override handleConfiguration(apexOptions: ApexOptions, { dataLabels, subtitle, title }: T) {
    apexOptions.chart = defuReplaceArray(
      {
        zoom: {
          enabled: false,
        },
      },
      apexOptions.chart,
    );
    apexOptions.dataLabels = defuReplaceArray(
      {
        enabled: dataLabels,
      },
      apexOptions.dataLabels,
    );
    apexOptions.subtitle = defuReplaceArray(
      {
        text: subtitle,
      },
      apexOptions.subtitle,
    );
    apexOptions.title = defuReplaceArray(
      {
        text: title,
      },
      apexOptions.title,
    );
  }

  override handleSchema(schema: z.ZodObject) {
    return z.object({ ...basicChartConfigurationSchema.shape, ...schema.shape });
  }
  // This is our base resolver that's always active
  override isActive() {
    return true;
  }
}
