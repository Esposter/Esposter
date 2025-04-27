import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";

export interface InterfaceProperty extends ItemEntityType<string> {
  name: string;
}
