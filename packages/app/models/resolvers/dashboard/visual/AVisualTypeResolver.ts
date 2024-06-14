import type { VisualType } from "@/models/dashboard/VisualType";
import type { ApexOptions } from "apexcharts";
import type { z } from "zod";

export abstract class AVisualTypeResolver {
  type: VisualType;

  constructor(type: VisualType) {
    this.type = type;
  }

  isActive(type: VisualType) {
    return type === this.type;
  }

  handleConfiguration(_apexOptions: ApexOptions) {}

  handleSchema(schema: z.AnyZodObject): z.AnyZodObject {
    return schema;
  }
}
