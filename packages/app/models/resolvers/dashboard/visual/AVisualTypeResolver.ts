import type { VisualType } from "@/models/dashboard/VisualType";
import type { ApexOptions } from "apexcharts";

export abstract class AVisualTypeResolver {
  type: VisualType;

  constructor(type: VisualType) {
    this.type = type;
  }

  isActive(type: VisualType) {
    return type === this.type;
  }

  handleConfiguration(_apexOptions: ApexOptions) {}
}
