import type { SearchClient } from "@azure/search-documents";
import type { SearchIndexDocumentMap } from "@esposter/db-schema";

import { deleteSearchDocumentsByFilter } from "#src/services/azure/search/deleteSearchDocumentsByFilter";
import { AZURE_MAX_PAGE_SIZE, CompositeKeyPropertyNames, getPartitionKeyFilter, serializeKey } from "@esposter/azure";
import { SearchIndex } from "@esposter/db-schema";
import { MockSearchClient, MockSearchDatabase } from "azure-mock";
import { afterEach, describe, expect, test } from "vitest";

describe(deleteSearchDocumentsByFilter, () => {
  const partitionKey = serializeKey(CompositeKeyPropertyNames.partitionKey);
  const rowKey = serializeKey(CompositeKeyPropertyNames.rowKey);

  afterEach(() => {
    MockSearchDatabase.clear();
  });

  test("deletes every document the filter matches, past the first page, and leaves the other partitions' documents", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();
    const otherRoomId = crypto.randomUUID();
    // The index is keyed by RowKey alone, so the other room's document holds a key no document of this room does
    const otherRoomDocument = { [partitionKey]: otherRoomId, [rowKey]: crypto.randomUUID() };
    // One document more than a page holds, so a single read cannot reach them all
    const roomDocuments = Array.from({ length: AZURE_MAX_PAGE_SIZE + 1 }, (_value, index) => ({
      [partitionKey]: roomId,
      [rowKey]: String(index),
    }));
    MockSearchDatabase.set(SearchIndex.Messages, [...roomDocuments, otherRoomDocument]);
    const searchClient = new MockSearchClient(SearchIndex.Messages) as unknown as SearchClient<
      SearchIndexDocumentMap[SearchIndex.Messages]
    >;

    await deleteSearchDocumentsByFilter(searchClient, getPartitionKeyFilter(roomId));

    expect(MockSearchDatabase.get(SearchIndex.Messages)).toStrictEqual([otherRoomDocument]);
  });

  test("succeeds without change when the filter matches nothing, as a replay after a finished sweep does", async () => {
    expect.hasAssertions();

    const otherRoomDocument = { [partitionKey]: crypto.randomUUID(), [rowKey]: crypto.randomUUID() };
    MockSearchDatabase.set(SearchIndex.Messages, [otherRoomDocument]);
    const searchClient = new MockSearchClient(SearchIndex.Messages) as unknown as SearchClient<
      SearchIndexDocumentMap[SearchIndex.Messages]
    >;

    await deleteSearchDocumentsByFilter(searchClient, getPartitionKeyFilter(crypto.randomUUID()));

    expect(MockSearchDatabase.get(SearchIndex.Messages)).toStrictEqual([otherRoomDocument]);
  });
});
