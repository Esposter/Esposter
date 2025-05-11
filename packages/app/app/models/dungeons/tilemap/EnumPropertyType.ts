import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { PropertyType } from "@/models/dungeons/tilemap/PropertyType";

export interface EnumPropertyType extends ItemEntityType<PropertyType.enum> {
  id: number;
  name: string;
  storageType: string;
  values: string[];
  valuesAsFlags: boolean;
}
