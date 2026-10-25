import type { ItemEntityType } from "@esposter/shared";
import type { PropertyType } from "parse-tmx";

export interface TiledIntProperty<TValue = never> extends ItemEntityType<PropertyType.Int> {
  name: string;
  value: TValue extends never ? number : TValue;
}
