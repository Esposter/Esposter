import type { CompositeKey } from "#shared/models/azure/CompositeKey";

import { Serializable } from "#shared/models/entity/Serializable";

export class CompositeKeyEntity extends Serializable implements CompositeKey {
  partitionKey!: string;
  rowKey!: string;
}
