import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { PropertyType } from "@/models/dungeons/tilemap/PropertyType";

export interface TiledClassProperty<TValue = never> extends ItemEntityType<PropertyType.class> {
  name: string;
  propertyType: string;
  value: TValue;
}
