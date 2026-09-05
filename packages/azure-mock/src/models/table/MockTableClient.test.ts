import type { TableEntity } from "@azure/data-tables";

import { MockTableClient } from "#src/models/table/MockTableClient";
import { MockTableDatabase } from "#src/store/MockTableDatabase";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";
import { afterEach, describe, expect, test } from "vitest";

const readByPage = async (client: MockTableClient, maxPageSize?: number) => {
  const entities = [];
  for await (const page of client.listEntities().byPage({ maxPageSize })) entities.push(...page);
  return entities;
};

describe(MockTableClient, () => {
  const tableName = "tableName";
  const partitionKey = "partitionKey";
  const createClient = async (entityCount: number) => {
    const client = new MockTableClient(tableName, tableName);
    for (let i = 0; i < entityCount; i++) await client.createEntity<TableEntity>({ partitionKey, rowKey: `${i}` });
    return client;
  };

  afterEach(() => {
    MockTableDatabase.clear();
  });

  test("iterates every entity exactly once with a bare for await", async () => {
    expect.hasAssertions();

    const client = await createClient(2);
    const rowKeys = [];
    for await (const entity of client.listEntities()) rowKeys.push(entity.rowKey);

    expect(rowKeys).toStrictEqual(["0", "1"]);
  });

  test("orders entities by partitionKey then rowKey regardless of insertion order", async () => {
    expect.hasAssertions();

    const client = new MockTableClient(tableName, tableName);
    await client.createEntity<TableEntity>({ partitionKey: " ", rowKey: "1" });
    await client.createEntity<TableEntity>({ partitionKey: "", rowKey: "1" });
    await client.createEntity<TableEntity>({ partitionKey: " ", rowKey: "0" });
    await client.createEntity<TableEntity>({ partitionKey: "", rowKey: "0" });
    const entities = await readByPage(client);

    // oxlint-disable-next-line no-shadow -- destructuring the entity's own partitionKey to project it, not the suite constant
    expect(entities.map(({ partitionKey, rowKey }) => ({ partitionKey, rowKey }))).toStrictEqual([
      { partitionKey: "", rowKey: "0" },
      { partitionKey: "", rowKey: "1" },
      { partitionKey: " ", rowKey: "0" },
      { partitionKey: " ", rowKey: "1" },
    ]);
  });

  test("rejects a page size above the azure hard limit like real azure table storage", async () => {
    expect.hasAssertions();

    const client = await createClient(1);

    await expect(readByPage(client, AZURE_MAX_PAGE_SIZE + 1)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[MockRestError: One of the request inputs is not valid.]`,
    );
  });

  test("allows a page size at the azure hard limit", async () => {
    expect.hasAssertions();

    const client = await createClient(1);
    const entities = await readByPage(client, AZURE_MAX_PAGE_SIZE);

    expect(entities).toHaveLength(1);
  });

  test("rejects a non-positive page size", async () => {
    expect.hasAssertions();

    const client = await createClient(1);

    await expect(readByPage(client, 0)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RangeError: maxPageSize must be greater than 0.]`,
    );
  });

  test("applies a conditional update when the etag matches the stored version", async () => {
    expect.hasAssertions();

    const client = await createClient(1);
    const { etag } = await client.getEntity(partitionKey, "0");
    await client.updateEntity({ count: 1, partitionKey, rowKey: "0" }, "Merge", { etag });
    const updatedEntity = await client.getEntity<{ count: number }>(partitionKey, "0");

    expect(updatedEntity.count).toBe(1);
  });

  test("rejects a conditional update whose etag is stale and keeps the stored entity", async () => {
    expect.hasAssertions();

    const client = await createClient(1);
    const { etag } = await client.getEntity(partitionKey, "0");
    await client.updateEntity({ count: 1, partitionKey, rowKey: "0" }, "Merge", { etag });

    // The mock applies updates synchronously before resolving, so the stale write throws rather than rejects
    expect(() => client.updateEntity({ count: 2, partitionKey, rowKey: "0" }, "Merge", { etag })).toThrow(
      "The update condition specified in the request was not satisfied.",
    );

    const storedEntity = await client.getEntity<{ count: number }>(partitionKey, "0");

    expect(storedEntity.count).toBe(1);
  });

  test("applies a wildcard or unconditional update regardless of the stored version", async () => {
    expect.hasAssertions();

    const client = await createClient(1);
    await client.updateEntity({ count: 1, partitionKey, rowKey: "0" }, "Merge", { etag: "*" });
    await client.updateEntity({ count: 2, partitionKey, rowKey: "0" });
    const updatedEntity = await client.getEntity<{ count: number }>(partitionKey, "0");

    expect(updatedEntity.count).toBe(2);
  });

  test("serves a fresh etag for every write so a reread never matches a superseded version", async () => {
    expect.hasAssertions();

    const client = await createClient(1);
    const { etag } = await client.getEntity(partitionKey, "0");
    await client.updateEntity({ count: 1, partitionKey, rowKey: "0" }, "Merge", { etag });
    const { etag: updatedEtag } = await client.getEntity(partitionKey, "0");

    expect(updatedEtag).not.toBe(etag);
  });
});
