import type { StreamTable } from "@esposter/db-schema";

import { getPartitionClauses } from "@esposter/db";
import { getStreamTableClient } from "#src/services/streams/getStreamTableClient";
import { describe } from "vitest";

export const readPartitionEntities = async (tableName: StreamTable, partitionKey: string) =>
  getStreamTableClient(tableName).list(getPartitionClauses(partitionKey));

describe.todo("readPartitionEntities");
