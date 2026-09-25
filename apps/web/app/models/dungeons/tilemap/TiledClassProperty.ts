import type { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import type { ItemEntityType } from "@esposter/shared";

export interface TiledClassProperty<TValue = never> extends ItemEntityType<PropertyType.Class> {
  name: string;
  propertyType: string;
  value: TValue;
}
