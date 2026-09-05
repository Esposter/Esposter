import { parseMachineJson } from "#src/services/exec/util/parseMachineJson";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";
// Parse untrusted JSON text (a probe's stdout, an on-disk cache/manifest file) into a typed value in one step:
// JSON-parse then zod-validate inside a single getResult, throwing an InvalidOperationError named for the caller when
// The content is missing, malformed, or an unexpected shape — so garbage surfaces as a diagnosed read failure rather
// Than feeding downstream as if it were a real value. `name` is the calling parser's own name so the error points at
// The concrete parser (parseOverlayManifest / parseTaskCacheEntry), not this shared helper. The schema is the only
// Thing that may interpret a value, which is why the parse is date-reviver-free (parseMachineJson): every string
// Field here is a path, and one shaped like an ISO datetime must reach the schema as the string it is.
export const parseJsonWithSchema = <TSchema extends z.ZodType>(
  json: string,
  schema: TSchema,
  name: string,
): z.infer<TSchema> =>
  getResult(() => schema.parse(parseMachineJson(json))).match(
    (value) => value,
    (error) => {
      // The `getResult` wrapper normalizes whatever was thrown to an Error (toAppError returns Error instances as-is), and ZodError
      // Extends Error — so a schema failure is still a ZodError here. z.prettifyError turns it into a readable
      // Multi-line message; anything else (a read failure, malformed JSON) carries its own.
      throw new InvalidOperationError(
        Operation.Read,
        name,
        error instanceof z.ZodError ? z.prettifyError(error) : error.message,
      );
    },
  );
