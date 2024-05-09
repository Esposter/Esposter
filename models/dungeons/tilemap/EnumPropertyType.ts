import type { PropertyType } from "@/models/dungeons/tilemap/PropertyType";

export interface EnumPropertyType {
  id: number;
  name: string;
  type: PropertyType.enum;
  storageType: string;
  values: string[];
  valuesAsFlags: boolean;
}
