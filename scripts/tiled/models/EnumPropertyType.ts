import type { PropertyType } from "@/scripts/tiled/models/PropertyType";

export interface EnumPropertyType {
  id: number;
  name: string;
  type: PropertyType.enum;
  storageType: string;
  values: string[];
  valuesAsFlags: boolean;
}
