import type { ItemEntityType } from "@esposter/shared";
import type { ApexOptions } from "apexcharts";
import type { z } from "zod";

import { VisualType } from "#shared/models/dashboard/data/VisualType";

export abstract class AVisualTypeResolver implements ItemEntityType<VisualType> {
  type;

  constructor(type = VisualType.Area) {
    this.type = type;
  }

  checkIsActive(type: VisualType) {
    return type === this.type;
  }

  handleConfiguration(_apexOptions: ApexOptions, _type: VisualType) {}

  handleSchema(schema: z.ZodObject): z.ZodObject {
    return schema;
  }
}
