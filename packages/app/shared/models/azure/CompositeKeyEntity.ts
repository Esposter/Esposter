import type { CompositeKey } from "#shared/models/azure/CompositeKey";
import type { z } from "zod";

import { Serializable } from "#shared/models/entity/Serializable";
import { getPropertyNames } from "#shared/util/getPropertyNames";

export interface CompositeKeyEntityConstraint extends z.ZodRawShape {
  partitionKey: z.ZodString;
  rowKey: z.ZodString;
}

export class CompositeKeyEntity extends Serializable implements CompositeKey {
  partitionKey!: string;
  rowKey!: string;
}

export const CompositeKeyEntityPropertyNames = getPropertyNames<CompositeKeyEntity>();

export const createCompositeKeyEntitySchema = <TEntity extends CompositeKeyEntityConstraint>(
  schema: z.ZodObject<TEntity>,
) => schema;
