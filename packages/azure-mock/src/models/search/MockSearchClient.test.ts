import { MockSearchClient } from "@/models/search/MockSearchClient";
import { MockSearchDatabase } from "@/store/MockSearchDatabase";
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
      { message: "needle", rowKey: "0", title: "ignored" },
      { message: "haystack", rowKey: "1", title: "needle" },
    ]);
    const { count, results } = await client.search("needle", { includeTotalCount: true, searchFields: ["message"] });
    const documents: Record<string, unknown>[] = [];
    for await (const { document } of results) documents.push(document);

    expect(count).toBe(1);
    expect(takeOne(documents).rowKey).toBe("0");
  });

  test("filters nested collection searchFields", async () => {
    expect.hasAssertions();

    const client = new MockSearchClient(indexName);
    await client.uploadDocuments([
      { files: [{ filename: "needle" }], rowKey: "0" },
      { files: [{ filename: "haystack" }], rowKey: "1" },
    ]);
    const { count, results } = await client.search("needle", {
      includeTotalCount: true,
      searchFields: ["files/filename"],
    });
    const documents: Record<string, unknown>[] = [];
    for await (const { document } of results) documents.push(document);

    expect(count).toBe(1);
    expect(takeOne(documents).rowKey).toBe("0");
  });
});
