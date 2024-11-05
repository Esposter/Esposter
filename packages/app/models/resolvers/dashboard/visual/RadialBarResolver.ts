import type { z } from "zod";

import { basicChartConfigurationSchema } from "@/models/dashboard/chart/BasicChartConfiguration";
import { VisualType } from "@/models/dashboard/VisualType";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";

export class RadialBarResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.RadialBar);
  }

  override handleSchema(schema: z.AnyZodObject) {
    return schema.omit({ [basicChartConfigurationSchema.keyof().Values.dataLabels]: true });
  }
}
