import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { PropertyType } from "@/models/dungeons/tilemap/PropertyType";

export interface TiledStringProperty<TValue = never> extends ItemEntityType<PropertyType.string> {
  name: string;
  // The enum if it exists
  propertyType?: string;
  value: TValue;
}
