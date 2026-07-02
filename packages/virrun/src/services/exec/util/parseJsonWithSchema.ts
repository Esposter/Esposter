import type { z } from "zod";

import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
// Parse untrusted JSON text (a probe's stdout, an on-disk cache/manifest file) into a typed value in one step:
// JSON-parse then zod-validate inside a single getResult, throwing an InvalidOperationError named for the caller when
// The content is missing, malformed, or an unexpected shape — so garbage surfaces as a diagnosed read failure rather
// Than feeding downstream as if it were a real value. `name` is the calling parser's own name so the error points at
// The concrete parser (parseOverlayManifest / parseTaskCacheEntry), not this shared helper.
export const parseJsonWithSchema = <TSchema extends z.ZodType>(
  json: string,
  schema: TSchema,
  name: string,
): z.infer<TSchema> =>
  getResult(() => schema.parse(JSON.parse(json))).match(
    (value) => value,
    (error) => {
      throw new InvalidOperationError(Operation.Read, name, error instanceof Error ? error.message : String(error));
    },
  );
