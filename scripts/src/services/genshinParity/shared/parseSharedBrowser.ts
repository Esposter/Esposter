import type { SharedBrowser } from "#src/models/genshinParity/shared/SharedBrowser";

import { getResult, jsonDateParse } from "@esposter/shared";

const checkIsSharedBrowser = (value: unknown): value is SharedBrowser =>
  typeof value === "object" &&
  value !== null &&
  "processId" in value &&
  typeof value.processId === "number" &&
  "wsEndpoint" in value &&
  typeof value.wsEndpoint === "string";

// What `browser start` wrote, or nothing when the text is not one: a file cut short while it was written is a shared
// Browser that never was, so a command launches its own rather than failing on it
export const parseSharedBrowser = (text: string): SharedBrowser | undefined =>
  getResult((): unknown => jsonDateParse<unknown>(text)).match(
    (content) => (checkIsSharedBrowser(content) ? content : undefined),
    () => undefined,
  );
