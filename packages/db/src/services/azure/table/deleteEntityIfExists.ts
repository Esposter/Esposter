import type { CompositeKey } from "@esposter/azure";
import type { CustomTableClient } from "@esposter/db-schema";

import { checkIsNotFound } from "#src/services/azure/error/checkIsNotFound";
import { getResultAsync, noop } from "@esposter/shared";

// An entity already gone is the success case, so a delete that is driven again converges. Every other failure,
// Throttling or a socket reset included, is a delete that did not happen and propagates
export const deleteEntityIfExists = (
  tableClient: CustomTableClient<CompositeKey>,
  { partitionKey, rowKey }: CompositeKey,
) =>
  getResultAsync(() => tableClient.deleteEntity(partitionKey, rowKey)).match(noop, (error) => {
    if (!checkIsNotFound(error)) throw error;
  });
