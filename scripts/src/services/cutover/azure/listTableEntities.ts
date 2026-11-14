import type { TableClient } from "@azure/data-tables";

import { AZURE_PAGE_SIZE, HTTP_NOT_FOUND } from "#src/services/cutover/constants";
import { getResultAsync } from "@esposter/shared";

interface ListTableEntitiesOptions {
  // An OData filter, such as the delta's `Timestamp gt datetime'...'`, or none for every entity
  filter?: string;
  // The properties to return; a count asks for the keys only
  select?: string[];
}

// Every entity of a table, page by page, as the service returns it: the system properties and the typed values Azure decoded, untouched.
// The copy decides what each one means. A table the source estate never created holds no entities: a feature that shipped
// After the estate stopped growing, such as programs, has its typed table in D1 and nothing in Azure to copy into it
export const listTableEntities = async function* (
  tableClient: TableClient,
  options: ListTableEntitiesOptions = {},
): AsyncGenerator<Record<string, unknown>, void> {
  const pages = tableClient.listEntities({ queryOptions: options }).byPage({ maxPageSize: AZURE_PAGE_SIZE });
  const firstPage = await getResultAsync(() => pages.next()).match(
    (result) => result,
    (error) => {
      if ("statusCode" in error && error.statusCode === HTTP_NOT_FOUND) return undefined;
      throw error;
    },
  );
  if (!firstPage || firstPage.done) return;
  yield* firstPage.value;
  for await (const page of pages) yield* page;
};
