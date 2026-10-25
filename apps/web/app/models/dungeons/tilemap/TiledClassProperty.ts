import type { ItemEntityType } from "@esposter/shared";
import type { PropertyType } from "parse-tmx";

export interface TiledClassProperty<TValue = never> extends ItemEntityType<PropertyType.Class> {
  name: string;
  propertyType: string;
  value: TValue;
}
