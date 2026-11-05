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
      { "": " ", " ": "", RowKey: "0" },
      { "": "", " ": " ", RowKey: "1" },
    ]);
    const { count, results } = await client.search(" ", { includeTotalCount: true, searchFields: [""] });
    const documents: Record<string, unknown>[] = [];
    for await (const { document } of results) documents.push(document);

    expect(count).toBe(1);
    expect(takeOne(documents).RowKey).toBe("0");
  });

  test("indexes each document whose RowKey differs from the others'", async () => {
    expect.hasAssertions();

    const client = new MockSearchClient(indexName);
    await client.uploadDocuments([{ RowKey: "0" }, { RowKey: "1" }]);
    const { count } = await client.search("*", { includeTotalCount: true });

    expect(count).toBe(2);
  });

  // The service keys a document by RowKey and upserts on it, so re-feeding a key leaves one document, holding the latest
  test("replaces a re-uploaded document rather than indexing a second copy", async () => {
    expect.hasAssertions();

    const client = new MockSearchClient(indexName);
    await client.uploadDocuments([{ message: "a", RowKey: "0" }]);
    await client.uploadDocuments([{ message: "b", RowKey: "0" }]);
    const { count, results } = await client.search("*", { includeTotalCount: true });
    const documents: Record<string, unknown>[] = [];
    for await (const { document } of results) documents.push(document);

    expect(count).toBe(1);
    expect(documents).toStrictEqual([{ message: "b", RowKey: "0" }]);
  });

  // The service names a composite key as the index stores it, so a filter on the partition reads the capitalized field
  test("filters on the partition key by the name the index stores it under", async () => {
    expect.hasAssertions();

    const partitionKey = crypto.randomUUID();
    MockSearchDatabase.set(indexName, [
      { PartitionKey: partitionKey, RowKey: "0" },
      { PartitionKey: crypto.randomUUID(), RowKey: "1" },
    ]);
    const client = new MockSearchClient(indexName);
    const { count, results } = await client.search("*", {
      filter: `PartitionKey eq '${partitionKey}'`,
      includeTotalCount: true,
    });
    const documents: Record<string, unknown>[] = [];
    for await (const { document } of results) documents.push(document);

    expect(count).toBe(1);
    expect(documents).toStrictEqual([{ PartitionKey: partitionKey, RowKey: "0" }]);
  });

  test("returns only the fields a search selects", async () => {
    expect.hasAssertions();

    MockSearchDatabase.set(indexName, [{ message: "message", RowKey: "0" }]);
    const client = new MockSearchClient(indexName);
    const { results } = await client.search("*", { select: ["RowKey"] });
    const documents: Record<string, unknown>[] = [];
    for await (const { document } of results) documents.push(document);

    expect(documents).toStrictEqual([{ RowKey: "0" }]);
  });

  test("deletes the documents whose key is listed, and reports each one as deleted", async () => {
    expect.hasAssertions();

    MockSearchDatabase.set(indexName, [{ RowKey: "0" }, { RowKey: "1" }]);
    const client = new MockSearchClient(indexName);
    const { results } = await client.deleteDocuments("RowKey", ["0", "2"]);

    expect(results).toStrictEqual([
      { key: "0", statusCode: 200, succeeded: true },
      { key: "2", statusCode: 200, succeeded: true },
    ]);
    expect(MockSearchDatabase.get(indexName)).toStrictEqual([{ RowKey: "1" }]);
  });

  test("filters nested collection searchFields", async () => {
    expect.hasAssertions();

    const client = new MockSearchClient(indexName);
    await client.uploadDocuments([
      { "": [{ "": " " }], RowKey: "0" },
      { "": [{ "": "" }], RowKey: "1" },
    ]);
    const { count, results } = await client.search(" ", { includeTotalCount: true, searchFields: ["/"] });
    const documents: Record<string, unknown>[] = [];
    for await (const { document } of results) documents.push(document);

    expect(count).toBe(1);
    expect(takeOne(documents).RowKey).toBe("0");
  });
});
