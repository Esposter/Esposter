import type { z } from "zod";

import { readKeyedCache } from "#src/services/exec/util/readKeyedCache";
import { getWslEnvironmentCachePath } from "#src/services/exec/wsl/getWslEnvironmentCachePath";

// The persisted win32 WSL environment probe result (`filename`) for `key`, or undefined when there is nothing usable
// To reuse so the caller falls through to a fresh probe — see readKeyedCache, which bounds every entry's age. Stored
// Where getWslEnvironmentCachePath says.
export const readWslEnvironmentCache = <TValue>(
  filename: string,
  valueSchema: z.ZodType<TValue>,
  key: string,
): TValue | undefined => readKeyedCache(getWslEnvironmentCachePath(filename), valueSchema, key);
