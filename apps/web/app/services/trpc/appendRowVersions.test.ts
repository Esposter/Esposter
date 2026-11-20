import type { RowVersion } from "@esposter/db-schema";

import { ROW_VERSIONS_HEADER } from "#shared/services/realtime/constants";
import { formatRowVersionHeaderValue } from "#shared/services/realtime/formatRowVersionHeaderValue";
import { describe } from "vitest";

// Stands in for the server's middleware, which appends each row a successful mutation changed to its response
export const appendRowVersions = (responseHeaders: Headers, path: string, rowVersions: RowVersion[]): void => {
  for (const rowVersion of rowVersions)
    responseHeaders.append(ROW_VERSIONS_HEADER, formatRowVersionHeaderValue(path, rowVersion));
};

describe.todo("appendRowVersions");
