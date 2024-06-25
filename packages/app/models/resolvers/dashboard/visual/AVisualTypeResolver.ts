import { VisualType } from "@/models/dashboard/VisualType";
import type { ApexOptions } from "apexcharts";
import type { z } from "zod";

export abstract class AVisualTypeResolver {
  type: VisualType;

  constructor(type = VisualType.Area) {
    this.type = type;
  }

  isActive(type: VisualType) {
    return type === this.type;
  }

  handleConfiguration(_apexOptions: ApexOptions, _type: VisualType) {}

  handleSchema(schema: z.AnyZodObject): z.AnyZodObject {
    return schema;
  }
}
