import type { BasicChartConfiguration } from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import type { ApexOptions } from "apexcharts";

import { basicChartConfigurationSchema } from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import { AChartTypeResolver } from "@/models/resolvers/dashboard/chart/AChartTypeResolver";
import { defu } from "defu";
import { z } from "zod";

export class BasicResolver<T extends BasicChartConfiguration> extends AChartTypeResolver<T> {
  constructor() {
    super(ChartType.Basic);
  }

  override checkIsActive() {
    return true;
  }

  override handleConfiguration(apexOptions: ApexOptions, { dataLabels, subtitle, title }: T) {
    // Defaults under what the visual resolvers already layered, since they run first: a scatter turns zoom on, and a
    // Funnel — which takes the data labels switch out of its form — draws its stage names as data labels
    apexOptions.chart = defu(apexOptions.chart, { zoom: { enabled: false } });
    apexOptions.dataLabels = defu(apexOptions.dataLabels, { enabled: dataLabels });
    apexOptions.subtitle = defu({ text: subtitle }, apexOptions.subtitle);
    apexOptions.title = defu({ text: title }, apexOptions.title);
  }

  override handleSchema(schema: z.ZodObject) {
    return z.object({ ...basicChartConfigurationSchema.shape, ...schema.shape });
  }
}
