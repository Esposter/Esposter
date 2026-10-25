import type { CompositeKey } from "@esposter/azure";

import { Serializable } from "@esposter/shared";

export class CompositeKeyEntity extends Serializable implements CompositeKey {
  declare partitionKey: string;
  declare rowKey: string;
}
