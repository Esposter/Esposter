import type { CompositeKey } from "@/models/azure/table/CompositeKey";
import type { z, ZodRawShape } from "zod";

import { Serializable } from "@esposter/shared";
// Azure Table Storage requires both keys to be strings, so the constraint is "a schema yielding a string" —
// Any string format qualifies (z.uuid(), z.iso.date(), a branded id), not just the two we happened to use first
export interface CompositeKeyEntityConstraint extends ZodRawShape {
  partitionKey: z.ZodType<string, string>;
  rowKey: z.ZodType<string, string>;
}

export class CompositeKeyEntity extends Serializable implements CompositeKey {
  declare partitionKey: string;
  declare rowKey: string;
}

export const createCompositeKeyEntitySchema = <TEntity extends CompositeKeyEntityConstraint>(
  schema: z.ZodObject<TEntity>,
) => schema;
