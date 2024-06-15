import { VisualType } from "@/models/dashboard/VisualType";
import { basicChartConfigurationSchema } from "@/models/dashboard/chart/BasicChartConfiguration";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import type { z } from "zod";

export class RadialBarResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.RadialBar);
  }

  handleSchema(schema: z.AnyZodObject) {
    return schema.omit({ [basicChartConfigurationSchema.keyof().Values.dataLabels]: true });
  }
}
