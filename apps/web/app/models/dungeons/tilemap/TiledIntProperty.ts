import type { ItemEntityType } from "@esposter/shared";
import type { PropertyType } from "parse-tmx";

export interface TiledIntProperty<TValue = never> extends ItemEntityType<typeof PropertyType.Int> {
  name: string;
  value: TValue extends never ? number : TValue;
}
