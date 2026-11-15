import type { ItemEntityType } from "@esposter/shared";
import type { PropertyType } from "parse-tmx";

export interface EnumPropertyType extends ItemEntityType<typeof PropertyType.Enum> {
  id: number;
  name: string;
  storageType: string;
  values: string[];
  valuesAsFlags: boolean;
}
