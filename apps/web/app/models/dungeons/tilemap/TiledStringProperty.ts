import type { ItemEntityType } from "@esposter/shared";
import type { PropertyType } from "parse-tmx";

export interface TiledStringProperty<TValue = never> extends ItemEntityType<PropertyType.String> {
  name: string;
  // The enum if it exists
  propertyType?: string;
  value: TValue;
}
