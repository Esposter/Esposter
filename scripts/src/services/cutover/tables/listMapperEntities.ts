import type { MapperEntity } from "#src/models/cutover/MapperEntity";
import type { TableClient } from "@azure/data-tables";
import type { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";

import { deserializeLegacyEntity } from "#src/services/cutover/azure/deserializeLegacyEntity";
import { listTableEntities } from "#src/services/cutover/azure/listTableEntities";

// Every entity of an Azure Table, read the way the legacy app read it, page by page. `filter` narrows it to the delta's changes
export const listMapperEntities = async function* (
  tableClient: TableClient,
  azureTable: LegacyAzureTable,
  options: { filter?: string; select?: string[] } = {},
): AsyncGenerator<MapperEntity> {
  for await (const raw of listTableEntities(tableClient, options)) yield deserializeLegacyEntity(azureTable, raw);
};
