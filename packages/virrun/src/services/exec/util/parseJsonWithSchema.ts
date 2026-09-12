import type { z } from "zod";

import { parseMachineJson } from "#src/services/exec/util/parseMachineJson";
import { parseWithSchema } from "#src/services/exec/util/parseWithSchema";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
// Parse untrusted JSON text (a probe's stdout, an on-disk cache/manifest file) into a typed value in one step:
// JSON-parse, then validate through parseWithSchema, so missing, malformed and mis-shaped content all surface as an
// InvalidOperationError named for the calling parser (parseOverlayManifest / parseTaskCacheEntry). The schema is the
// Only thing that may interpret a value, which is why the parse is date-reviver-free (parseMachineJson): every
// String field here is a path, and one shaped like an ISO datetime must reach the schema as the string it is.
export const parseJsonWithSchema = <TSchema extends z.ZodType>(
  json: string,
  schema: TSchema,
  name: string,
): z.infer<TSchema> =>
  getResult(() => parseMachineJson(json)).match(
    (value) => parseWithSchema(value, schema, name),
    (error) => {
      throw new InvalidOperationError(Operation.Read, name, error.message);
    },
  );
