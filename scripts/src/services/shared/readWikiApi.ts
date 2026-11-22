import type { z } from "zod";

import { fetchOk } from "#src/services/shared/fetchOk";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";

// Every read of the wiki's API the scripts make: the answer is checked by the schema its caller reads it by before it is
// Returned, so a caller that caches what it read caches only an answer the schema took. A refusal throws, which keeps the
// Error answer the API gives under HTTP 200 out of every cache
export const readWikiApi = async <TSchema extends z.ZodType>(
  url: string,
  schema: TSchema,
): Promise<z.output<TSchema>> => schema.parse(parseMachineJson(await (await fetchOk(url)).text()));
