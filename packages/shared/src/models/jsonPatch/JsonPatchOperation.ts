import { JsonPatchOperationType } from "#src/models/jsonPatch/JsonPatchOperationType";
import { jsonPointerSchema } from "#src/models/jsonPatch/JsonPointer";
import { z } from "zod";

// One RFC 6902 operation, its paths RFC 6901 JSON Pointers from the document's root
export type JsonPatchOperation = JsonPatchFromOperation | JsonPatchRemoveOperation | JsonPatchValueOperation;

interface JsonPatchFromOperation {
  from: string;
  op: JsonPatchOperationType.Copy | JsonPatchOperationType.Move;
  path: string;
}

interface JsonPatchRemoveOperation {
  op: JsonPatchOperationType.Remove;
  path: string;
}

interface JsonPatchValueOperation {
  op: JsonPatchOperationType.Add | JsonPatchOperationType.Replace | JsonPatchOperationType.Test;
  path: string;
  value: unknown;
}

export const jsonPatchOperationSchema: z.ZodDiscriminatedUnion<
  [
    z.ZodObject<{
      from: z.ZodString;
      op: z.ZodEnum<{ copy: JsonPatchOperationType.Copy; move: JsonPatchOperationType.Move }>;
      path: z.ZodString;
    }>,
    z.ZodObject<{ op: z.ZodLiteral<JsonPatchOperationType.Remove>; path: z.ZodString }>,
    z.ZodObject<{
      op: z.ZodEnum<{
        add: JsonPatchOperationType.Add;
        replace: JsonPatchOperationType.Replace;
        test: JsonPatchOperationType.Test;
      }>;
      path: z.ZodString;
      value: z.ZodUnknown;
    }>,
  ],
  "op"
> = z.discriminatedUnion("op", [
  z.object({
    from: jsonPointerSchema,
    op: z.enum([JsonPatchOperationType.Copy, JsonPatchOperationType.Move]),
    path: jsonPointerSchema,
  }),
  z.object({ op: z.literal(JsonPatchOperationType.Remove), path: jsonPointerSchema }),
  z.object({
    op: z.enum([JsonPatchOperationType.Add, JsonPatchOperationType.Replace, JsonPatchOperationType.Test]),
    path: jsonPointerSchema,
    // Any JSON until the document it lands in is parsed by its own schema, but a key left out is not a value
    value: z.unknown().refine((value) => value !== undefined, { error: "Invalid input: expected a value" }),
  }),
]) satisfies z.ZodType<JsonPatchOperation>;
