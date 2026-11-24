import type { RowVersion } from "@esposter/db-schema";

import { TOPICS_HEADER_SEPARATOR } from "#shared/services/realtime/constants";

// One changed row's entry in the row versions header: its procedure path, then the row encoded whole, so a key's value
// Holds no separator the header reads. The row is JSON, which names its key, its table and its version in one value
export const formatRowVersionHeaderValue = (path: string, rowVersion: RowVersion): string =>
  `${path}${TOPICS_HEADER_SEPARATOR}${encodeURIComponent(JSON.stringify(rowVersion))}`;
