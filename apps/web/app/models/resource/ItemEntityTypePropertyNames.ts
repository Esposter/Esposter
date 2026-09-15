import type { ItemEntityType, PropertyNames } from "@esposter/shared";

import { getPropertyNames } from "@esposter/shared";

export const ItemEntityTypePropertyNames: PropertyNames<ItemEntityType<string>> =
  getPropertyNames<ItemEntityType<string>>();
