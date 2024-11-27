import type { CompositeKey } from "#shared/models/azure/CompositeKey";

export class CompositeKeyEntity implements CompositeKey {
  partitionKey!: string;
  rowKey!: string;
}
