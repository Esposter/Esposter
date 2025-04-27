import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { PropertyType } from "@/models/dungeons/tilemap/PropertyType";

export interface TiledIntProperty<TValue = never> extends ItemEntityType<PropertyType.int> {
  name: string;
  value: TValue extends never ? number : TValue;
}
