import type { z } from "zod";

import { fetchJson } from "#src/services/shared/fetchJson";

// Every read of the wiki's API the scripts make: the answer is checked by the schema its caller reads it by before it
// Is returned, so a caller that caches what it read caches only an answer the schema took. A refusal throws, which
// Keeps the Error answer the API gives under HTTP 200 out of every cache. The body is bounded by `maxBytes`, as
// `fetchJson` bounds it
export const readWikiApi = async <TSchema extends z.ZodType>(
  url: string,
  schema: TSchema,
  maxBytes: number,
): Promise<z.output<TSchema>> => schema.parse(await fetchJson(url, maxBytes));
