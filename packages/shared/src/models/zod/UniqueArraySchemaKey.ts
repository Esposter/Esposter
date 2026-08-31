import type { z } from "zod";

// Every key is offered, including one whose value is an object — which the `Set` would compare by reference,
// Exactly as it would an unkeyed object schema. Filtering those out is not expressible: the filter has to ask
// `z.output<…> extends Primitive` per key, and a schema factory generic in one of its fields
// (`createSortItemSchema`'s `key: T`) leaves that conditional deferred, so the whole mapped type resolves to
// Nothing and a concrete key stops being assignable. The no-key overload is closed against the same hole in
// `CreateUniqueArraySchema`, where the output is one type rather than one per key and the check does resolve
export type UniqueArraySchemaKey<TSchema extends z.ZodType> = TSchema extends z.ZodObject
  ? keyof TSchema["shape"] & string
  : keyof z.output<TSchema> & string;
