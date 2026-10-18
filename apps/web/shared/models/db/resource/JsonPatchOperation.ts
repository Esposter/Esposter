import type { JsonPatchOperation } from "@esposter/shared";

import { jsonPointerSchema } from "#shared/models/db/resource/JsonPointer";
import { JsonPatchOperationType } from "@esposter/shared";
import { z } from "zod";

// The wire shape of one operation, checked at the request; the applier in @esposter/shared applies what passes
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
