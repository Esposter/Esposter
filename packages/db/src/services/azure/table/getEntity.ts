import type { AzureEntity, CustomTableClient } from "@esposter/db-schema";
import type { Class } from "type-fest";

import { deserializeEntity } from "@/services/azure/transformer/deserializeEntity";
import { toAppError } from "@esposter/shared";
import { ResultAsync } from "neverthrow";

export const getEntity = async <TTableEntity extends AzureEntity, TEntity extends TTableEntity>(
  tableClient: CustomTableClient<TTableEntity>,
  cls: Class<TEntity>,
  ...args: Parameters<CustomTableClient<TTableEntity>["getEntity"]>
): Promise<null | TEntity> => {
  return ResultAsync.fromPromise(
    (async () => {
      const { etag: _etag, ...entity } = await tableClient.getEntity(...args);
      return deserializeEntity(entity, cls);
    })(),
    toAppError,
  ).unwrapOr(null);
};
