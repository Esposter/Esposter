import type { ItemMetadata } from "#src/models/shared/ItemMetadata";
import type { PropertyNames } from "#src/util/types/PropertyNames";

import { getPropertyNames } from "#src/util/object/getPropertyNames";

export const ItemMetadataPropertyNames: PropertyNames<ItemMetadata> = getPropertyNames<ItemMetadata>();
