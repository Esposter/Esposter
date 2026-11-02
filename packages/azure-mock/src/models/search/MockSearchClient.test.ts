import { MockSearchClient } from "#src/models/search/MockSearchClient";
import { MockSearchDatabase } from "#src/store/MockSearchDatabase";
import { takeOne } from "@esposter/shared";
import { afterEach, describe, expect, test } from "vitest";

describe(MockSearchClient, () => {
  const indexName = "indexName";

  afterEach(() => {
    MockSearchDatabase.clear();
  });

  test("filters by searchText across searchFields", async () => {
    expect.hasAssertions();

    const client = new MockSearchClient(indexName);
    await client.uploadDocuments([
      { "": " ", " ": "", rowKey: "0" },
      { "": "", " ": " ", rowKey: "1" },
    ]);
    const { count, results } = await client.search(" ", { includeTotalCount: true, searchFields: [""] });
    const documents: Record<string, unknown>[] = [];
    for await (const { document } of results) documents.push(document);

    expect(count).toBe(1);
    expect(takeOne(documents).rowKey).toBe("0");
  });

  // The service keys a document by RowKey and upserts on it, so re-feeding a key leaves one document, holding the latest
  test("replaces a re-uploaded document rather than indexing a second copy", async () => {
    expect.hasAssertions();

    const client = new MockSearchClient(indexName);
    await client.uploadDocuments([{ message: "a", rowKey: "0" }]);
    await client.uploadDocuments([{ message: "b", rowKey: "0" }]);
    const { count, results } = await client.search("*", { includeTotalCount: true });
    const documents: Record<string, unknown>[] = [];
    for await (const { document } of results) documents.push(document);

    expect(count).toBe(1);
    expect(documents).toStrictEqual([{ message: "b", rowKey: "0" }]);
  });

  test("filters nested collection searchFields", async () => {
    expect.hasAssertions();

    const client = new MockSearchClient(indexName);
    await client.uploadDocuments([
      { "": [{ "": " " }], rowKey: "0" },
      { "": [{ "": "" }], rowKey: "1" },
    ]);
    const { count, results } = await client.search(" ", { includeTotalCount: true, searchFields: ["/"] });
    const documents: Record<string, unknown>[] = [];
    for await (const { document } of results) documents.push(document);

    expect(count).toBe(1);
    expect(takeOne(documents).rowKey).toBe("0");
  });
});
