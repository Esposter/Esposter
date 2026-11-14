import type { TableClient } from "@azure/data-tables";

import { AZURE_PAGE_SIZE } from "#src/services/cutover/constants";

interface ListTableEntitiesOptions {
  // An OData filter, such as the delta's `Timestamp gt datetime'...'`, or none for every entity
  filter?: string;
  // The properties to return; a count asks for the keys only
  select?: string[];
}

// Every entity of a table, page by page, as the service returns it: the system properties and the typed values Azure
// decoded, untouched. The copy decides what each one means
export const listTableEntities = async function* (
  tableClient: TableClient,
  options: ListTableEntitiesOptions = {},
): AsyncGenerator<Record<string, unknown>, void> {
  for await (const page of tableClient
    .listEntities<Record<string, unknown>>({ queryOptions: options })
    .byPage({ maxPageSize: AZURE_PAGE_SIZE }))
    yield* page;
};
