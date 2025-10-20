import type { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import type { ItemEntityType } from "@esposter/shared";

export interface TiledIntProperty<TValue = never> extends ItemEntityType<PropertyType.int> {
  name: string;
  value: TValue extends never ? number : TValue;
}
