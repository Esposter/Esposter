import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Clause, CustomTableClient } from "@esposter/db-schema";

import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { readCursorPaginationDataAzureTable } from "@@/server/services/pagination/cursor/readCursorPaginationDataAzureTable";
import { createEntity } from "@esposter/db";
import {
  AdminActionType,
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  ModerationLogEntity,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readCursorPaginationDataAzureTable, () => {
  const partitionKey = crypto.randomUUID();
  const otherPartitionKey = crypto.randomUUID();
  const rowKeys = ["0", "1"];
  const sortBy: SortItem<keyof ModerationLogEntity>[] = [MESSAGE_ROWKEY_SORT_ITEM];
  const clauses: Clause<ModerationLogEntity>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: partitionKey },
  ];
  let moderationLogClient: CustomTableClient<ModerationLogEntity>;
  const createModerationLogEntity = (entityPartitionKey: string, rowKey: string) =>
    createEntity(
      moderationLogClient,
      new ModerationLogEntity({
        actorUserId: "",
        partitionKey: entityPartitionKey,
        rowKey,
        targetUserId: "",
        type: AdminActionType.Warn,
      }),
    );
  const readPage = (cursor: string, limit: number) =>
    readCursorPaginationDataAzureTable(moderationLogClient, ModerationLogEntity, { clauses, cursor, limit, sortBy });

  beforeEach(async () => {
    moderationLogClient = await useTableClient(AzureTable.ModerationLog);
    for (const rowKey of rowKeys) await createModerationLogEntity(partitionKey, rowKey);
    await createModerationLogEntity(otherPartitionKey, takeOne(rowKeys));
  });

  afterEach(() => {
    MockTableDatabase.clear();
  });

  test("returns only the entities the clauses match when the limit covers them", async () => {
    expect.hasAssertions();

    const page = await readPage("", rowKeys.length);

    expect(page.hasMore).toBe(false);
    expect(page.items.map(({ rowKey }) => rowKey)).toStrictEqual(rowKeys);
  });

  test("caps the page at the limit and reports there is more", async () => {
    expect.hasAssertions();

    const page = await readPage("", 1);

    expect(page.hasMore).toBe(true);
    expect(page.items.map(({ rowKey }) => rowKey)).toStrictEqual([takeOne(rowKeys)]);
  });

  // The two reads share one `clauses` array, so a helper that appended the cursor clause to it in place would
  // Carry the first page's cursor into the second and return nothing
  test("resumes after the previous page's cursor", async () => {
    expect.hasAssertions();

    const firstPage = await readPage("", 1);
    const secondPage = await readPage(firstPage.nextCursor, 1);

    expect(secondPage.hasMore).toBe(false);
    expect(secondPage.items.map(({ rowKey }) => rowKey)).toStrictEqual([takeOne(rowKeys, 1)]);
  });
});
