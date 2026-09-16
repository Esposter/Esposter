import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";
// Validate an already-deserialized value against a schema, throwing an InvalidOperationError named for the caller
// When the shape is wrong — so garbage surfaces as a diagnosed read failure rather than feeding downstream as if it
// Were a real value. `name` is the calling parser's own name so the error points at the concrete parser, not this
// Shared helper. The `getResult` wrapper normalizes whatever was thrown to an Error (toAppError returns Error
// Instances as-is), and ZodError extends Error — so a schema failure is still a ZodError here, and z.prettifyError
// Turns it into a readable multi-line message; anything else carries its own.
export const parseWithSchema = <TSchema extends z.ZodType>(
  value: unknown,
  schema: TSchema,
  name: string,
): z.infer<TSchema> =>
  getResult(() => schema.parse(value)).match(
    (parsedValue) => parsedValue,
    (error) => {
      throw new InvalidOperationError(
        Operation.Read,
        name,
        error instanceof z.ZodError ? z.prettifyError(error) : error.message,
      );
    },
  );
