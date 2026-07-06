import type { TableEntity } from "@azure/data-tables";

import { MockTableClient } from "@/models/table/MockTableClient";
import { MockTableDatabase } from "@/store/MockTableDatabase";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/db-schema";
import { afterEach, describe, expect, test } from "vitest";

describe(MockTableClient, () => {
  const tableName = "tableName";
  const partitionKey = "partitionKey";
  const createClient = async (entityCount: number) => {
    const client = new MockTableClient(tableName, tableName);
    for (let i = 0; i < entityCount; i++) await client.createEntity<TableEntity>({ partitionKey, rowKey: `${i}` });
    return client;
  };
  const readByPage = async (client: MockTableClient, maxPageSize?: number) => {
    const entities = [];
    for await (const page of client.listEntities().byPage({ maxPageSize })) entities.push(...page);
    return entities;
  };

  afterEach(() => {
    MockTableDatabase.clear();
  });

  test("rejects a page size above the azure hard limit like real azure table storage", async () => {
    expect.hasAssertions();

    const client = await createClient(1);

    await expect(readByPage(client, AZURE_MAX_PAGE_SIZE + 1)).rejects.toThrow(
      "One of the request inputs is not valid.",
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

    await expect(readByPage(client, 0)).rejects.toThrow("maxPageSize must be greater than 0.");
  });
});
