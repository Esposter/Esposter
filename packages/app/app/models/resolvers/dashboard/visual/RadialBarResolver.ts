import type { z } from "zod/v4";

import { basicChartConfigurationSchema } from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";

export class RadialBarResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.RadialBar);
  }

  override handleSchema(schema: z.ZodObject) {
    return schema.omit({ [basicChartConfigurationSchema.keyof().enum.dataLabels]: true });
  }
}
