import type { AzureEntity, CustomTableClient } from "@esposter/db-schema";
import type { Class } from "type-fest";

import { getEntityWithEtag } from "@/services/azure/table/getEntityWithEtag";

// Reads through getEntityWithEtag and drops the etag for callers that don't need optimistic concurrency,
// Keeping the not-found sentinel as null rather than the etag reader's undefined
export const getEntity = async <TTableEntity extends AzureEntity, TEntity extends TTableEntity>(
  tableClient: CustomTableClient<TTableEntity>,
  cls: Class<TEntity>,
  ...args: Parameters<CustomTableClient<TTableEntity>["getEntity"]>
): Promise<null | TEntity> => {
  const result = await getEntityWithEtag(tableClient, cls, ...args);
  return result ? result.entity : null;
};
