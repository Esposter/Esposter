import type { ItemMetadata } from "#shared/models/shared/ItemMetadata";
import type { PropertyNames } from "@esposter/shared";

import { getPropertyNames } from "@esposter/shared";

export const ItemMetadataPropertyNames: PropertyNames<ItemMetadata> = getPropertyNames<ItemMetadata>();
