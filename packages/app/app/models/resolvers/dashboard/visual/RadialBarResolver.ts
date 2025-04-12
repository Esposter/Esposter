import type { BasicChartConfiguration } from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import type { Type } from "arktype";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";

export class RadialBarResolver extends AVisualTypeResolver {
  constructor() {
    super(VisualType.RadialBar);
  }

  override handleSchema(schema: Type<BasicChartConfiguration>) {
    return schema.omit("dataLabels");
  }
}
