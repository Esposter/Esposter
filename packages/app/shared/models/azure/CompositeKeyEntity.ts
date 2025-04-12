import type { CompositeKey } from "#shared/models/azure/CompositeKey";
import type { ToData } from "#shared/models/entity/ToData";
import type { type } from "arktype";

import { Serializable } from "#shared/models/entity/Serializable";

export class CompositeKeyEntity extends Serializable implements CompositeKey {
  partitionKey!: string;
  rowKey!: string;
}

export const createCompositeKeyEntitySchema = <TEntity extends ToData<CompositeKeyEntity>>(schema: type.Any<TEntity>) =>
  schema;
