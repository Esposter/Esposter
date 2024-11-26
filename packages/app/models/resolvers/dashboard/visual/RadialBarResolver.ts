import type { z } from "zod";

import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import { basicChartConfigurationSchema } from "@/shared/models/dashboard/data/chart/BasicChartConfiguration";
import { VisualType } from "@/shared/models/dashboard/data/VisualType";

export class RadialBarResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.RadialBar);
  }

  override handleSchema(schema: z.AnyZodObject) {
    return schema.omit({ [basicChartConfigurationSchema.keyof().Values.dataLabels]: true });
  }
}
