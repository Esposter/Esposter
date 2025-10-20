import type { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import type { ItemEntityType } from "@esposter/shared";

export interface TiledStringProperty<TValue = never> extends ItemEntityType<PropertyType.string> {
  name: string;
  // The enum if it exists
  propertyType?: string;
  value: TValue;
}
