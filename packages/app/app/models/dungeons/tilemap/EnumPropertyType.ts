import type { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import type { ItemEntityType } from "@esposter/shared";

export interface EnumPropertyType extends ItemEntityType<PropertyType.enum> {
  id: number;
  name: string;
  storageType: string;
  values: string[];
  valuesAsFlags: boolean;
}
