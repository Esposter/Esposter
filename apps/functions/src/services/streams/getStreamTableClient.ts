import type { StreamTable, StreamTableEntityMap } from "@esposter/db-schema";
import type { StreamTableClient } from "@esposter/db";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The functions app is Node and holds no D1 binding: its rows move with the Worker that reads the `STREAMS` binding
// (infra-cloudflare-jobs). Until that move lands there is no handle to build a client on, so an acquisition is refused
// by name instead of reaching for the Azure connection string this file used to read
export const getStreamTableClient = <TStreamTable extends StreamTable>(
  tableName: TStreamTable,
): StreamTableClient<StreamTableEntityMap[TStreamTable]> => {
  throw new InvalidOperationError(Operation.Read, getStreamTableClient.name, tableName);
};
