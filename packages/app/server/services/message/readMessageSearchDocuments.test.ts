import { readMessageSearchDocuments } from "@@/server/services/message/readMessageSearchDocuments";
import { CompositeKeyPropertyNames, serializeKey } from "@esposter/azure";
import { MessageType, SearchIndex, StandardMessageEntity } from "@esposter/db-schema";
import { MockSearchClient, MockSearchDatabase } from "azure-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(readMessageSearchDocuments, () => {
  const partitionKey = crypto.randomUUID();
  const rowKey = crypto.randomUUID();
  const message = "message";
  const limit = 1;
  const offset = 1;

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    MockSearchDatabase.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // A caller filtering on structure alone — the room's Files tab, a member's sent messages — gets an empty page
  // Unless the match-all stands in, and the extra row both callers answer `hasMore` with is part of that page
  test.each([
    [undefined, "*"],
    ["", "*"],
    [message, message],
  ])("query %s searches for %s from the offset, one row past the limit", async (query, searchText) => {
    expect.hasAssertions();

    const search = vi.spyOn(MockSearchClient.prototype, "search");

    await readMessageSearchDocuments({ limit, offset, query });

    expect(search).toHaveBeenCalledExactlyOnceWith(searchText, {
      includeTotalCount: true,
      skip: offset,
      top: limit + 1,
    });
  });

  // The index stores the composite key capitalized, so a page handed back undeserialized carries neither
  // `partitionKey` nor `rowKey`, which every caller reads
  test("returns each document as the entity its serialized keys name", async () => {
    expect.hasAssertions();

    MockSearchDatabase.set(SearchIndex.Messages, [
      {
        message,
        [serializeKey(CompositeKeyPropertyNames.partitionKey)]: partitionKey,
        [serializeKey(CompositeKeyPropertyNames.rowKey)]: rowKey,
        type: MessageType.Message,
      },
    ]);

    await expect(readMessageSearchDocuments({ limit, offset: 0 })).resolves.toStrictEqual({
      count: 1,
      messages: [new StandardMessageEntity({ message, partitionKey, rowKey, type: MessageType.Message })],
    });
  });
});
