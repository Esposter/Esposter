import type { MockD1Database } from "@esposter/db-mock";
import type { StreamTable, StreamTableEntityMap } from "@esposter/db-schema";

import { StreamTableClient } from "@esposter/db";
import { createMockDb, emptyD1Database } from "@esposter/db-mock";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { drizzle } from "drizzle-orm/d1";
import { describe } from "vitest";

// The streams database a suite opened, served by the same Miniflare instance as its core database. The client is built
// synchronously over it, as production builds one over the STREAMS binding, so a suite opens it in its beforeAll
let mockStreamsDb: MockD1Database | undefined;

export const openMockStreams = async (): Promise<void> => {
  mockStreamsDb = (await createMockDb()).streamsDb;
};

export const clearMockStreams = async (): Promise<void> => {
  if (mockStreamsDb) await emptyD1Database(mockStreamsDb);
};

export const getStreamTableClient = <TStreamTable extends StreamTable>(
  tableName: TStreamTable,
): StreamTableClient<StreamTableEntityMap[TStreamTable]> => {
  if (!mockStreamsDb) throw new InvalidOperationError(Operation.Read, getStreamTableClient.name, tableName);

  return new StreamTableClient(drizzle(mockStreamsDb), tableName);
};

describe.todo("getStreamTableClient");
