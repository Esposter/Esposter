import type { ApexOptions } from "apexcharts";
import type { Type } from "arktype";

import { VisualType } from "#shared/models/dashboard/data/VisualType";

export abstract class AVisualTypeResolver {
  type: VisualType;

  constructor(type = VisualType.Area) {
    this.type = type;
  }

  handleConfiguration(_apexOptions: ApexOptions, _type: VisualType) {}

  handleSchema(schema: Type<object>): Type<object> {
    return schema;
  }

  isActive(type: VisualType) {
    return type === this.type;
  }
}
