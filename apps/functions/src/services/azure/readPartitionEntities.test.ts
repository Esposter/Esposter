import type { AzureTable } from "@esposter/db-schema";

import { MockTableDatabase } from "azure-mock";
import { describe } from "vitest";

export const readPartitionEntities = (tableName: AzureTable, partitionKey: string) =>
  [...(MockTableDatabase.get(tableName)?.values() ?? [])].filter((entity) => entity.partitionKey === partitionKey);

describe.todo("readPartitionEntities");
