import type { ApexOptions } from "apexcharts";
import type { z } from "zod";

import { VisualType } from "@/models/dashboard/VisualType";

export abstract class AVisualTypeResolver {
  type: VisualType;

  constructor(type = VisualType.Area) {
    this.type = type;
  }

  handleConfiguration(_apexOptions: ApexOptions, _type: VisualType) {}

  handleSchema(schema: z.AnyZodObject): z.AnyZodObject {
    return schema;
  }

  isActive(type: VisualType) {
    return type === this.type;
  }
}
