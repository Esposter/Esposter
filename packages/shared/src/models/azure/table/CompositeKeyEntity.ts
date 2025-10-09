import type { CompositeKey } from "@/models/azure/table/CompositeKey";
import type { z } from "zod";

import { Serializable } from "@/models/shared/Serializable";

export interface CompositeKeyEntityConstraint extends z.ZodRawShape {
  partitionKey: z.ZodString | z.ZodUUID;
  rowKey: z.ZodString | z.ZodUUID;
}

export class CompositeKeyEntity extends Serializable implements CompositeKey {
  partitionKey!: string;
  rowKey!: string;
}

export const createCompositeKeyEntitySchema = <TEntity extends CompositeKeyEntityConstraint>(
  schema: z.ZodObject<TEntity>,
): z.ZodObject<TEntity> => schema;
