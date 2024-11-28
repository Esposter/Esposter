import type { PropertyType } from "@/models/dungeons/tilemap/PropertyType";

export interface EnumPropertyType {
  id: number;
  name: string;
  storageType: string;
  type: PropertyType.enum;
  values: string[];
  valuesAsFlags: boolean;
}
