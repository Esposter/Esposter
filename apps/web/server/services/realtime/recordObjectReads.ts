import type { ColumnTopic } from "@esposter/db-schema";

import { requestObjectReadsStorage } from "#server/services/realtime/requestObjectReadsStorage";

// Records a read set an object reported, into the request in scope when there is one: a call made outside a request
// Watches nothing
export const recordObjectReads = (readSet: ColumnTopic[]) => {
  requestObjectReadsStorage.getStore()?.push(...readSet);
};
