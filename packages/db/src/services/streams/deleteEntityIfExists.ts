import type { StreamTableClient } from "#src/models/streams/StreamTableClient";
import type { CompositeKey } from "@esposter/db-schema";

import { checkIsStreamTableError } from "#src/services/streams/error/checkIsStreamTableError";
import { getResultAsync, noop } from "@esposter/shared";

// A row already gone is the success case, so a delete that is driven again converges. Every other failure propagates,
// since a delete that did not happen must not be reported as one that did
export const deleteEntityIfExists = (
  tableClient: StreamTableClient<CompositeKey>,
  { partitionKey, rowKey }: CompositeKey,
) =>
  getResultAsync(() => tableClient.deleteEntity(partitionKey, rowKey)).match(noop, (error) => {
    if (!checkIsStreamTableError(error, "notFound")) throw error;
  });
