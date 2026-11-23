import type { z } from "zod";

// Every key is offered, including one whose value is an object — which the `Set` would compare by reference, Exactly as
// It would an unkeyed object schema. Filtering those out is not expressible: the filter has to ask `z.output<…> extends
// Primitive` per key, and a schema factory generic in one of its fields (one whose `key` is a type parameter) leaves
// That conditional deferred, so the whole mapped type resolves to Nothing and a concrete key stops being assignable.
// The keyless form, `createUniquePrimitiveArraySchema`, is closed Against the same hole by its constraint instead: its
// Output is one type rather than one per key, so the check resolves
export type UniqueArraySchemaKey<TSchema extends z.ZodType> = TSchema extends z.ZodObject
  ? keyof TSchema["shape"] & string
  : keyof z.output<TSchema> & string;
