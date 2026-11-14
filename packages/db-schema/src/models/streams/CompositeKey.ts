import type { PropertyNames } from "@esposter/shared";

import { getPropertyNames } from "@esposter/shared";

export class CompositeKey {
  declare partitionKey: string;
  declare rowKey: string;
}

export const CompositeKeyPropertyNames: PropertyNames<CompositeKey> = getPropertyNames<CompositeKey>();
