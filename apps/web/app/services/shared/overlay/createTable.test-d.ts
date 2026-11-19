import type { KeyedView } from "#src/models/shared/overlay/KeyedView";
import type { RowKeyOf } from "#src/models/shared/overlay/RowKeyOf";
import type { Table } from "#src/models/shared/overlay/Table";
import type { BlockInSocial, FriendInSocial } from "@esposter/db-schema";

import { createTable } from "#src/services/shared/overlay/createTable";
import { blocksInSocial, friendsInSocial } from "@esposter/db-schema";
import { describe, expect, expectTypeOf, test } from "vitest";

declare const view: KeyedView;

describe("createTable type", () => {
  test("a single primary key types a row's key as one level", () => {
    expect.hasAssertions();

    expectTypeOf<RowKeyOf<typeof friendsInSocial>>().toEqualTypeOf<readonly [string]>();
  });

  test("a composite primary key types a row's key as one level per key column, in the order the key lists them", () => {
    expect.hasAssertions();

    expectTypeOf<RowKeyOf<typeof blocksInSocial>>().toEqualTypeOf<readonly [string, string]>();
  });

  test("the row is the table's select model, and the table is typed by its source", () => {
    expect.hasAssertions();

    expectTypeOf(createTable(friendsInSocial)).toEqualTypeOf<Table<FriendInSocial, typeof friendsInSocial>>();
    expectTypeOf(createTable(blocksInSocial)).toEqualTypeOf<Table<BlockInSocial, typeof blocksInSocial>>();
  });

  test("a view takes a key with one level per key column of its table, and refuses any other length", () => {
    expect.hasAssertions();

    view.get(createTable(friendsInSocial), [""]);
    view.get(createTable(blocksInSocial), ["", ""]);
    // @ts-expect-error A single primary key is one level, so a key of two levels is refused
    view.get(createTable(friendsInSocial), ["", ""]);
    // @ts-expect-error A composite primary key is two levels, so a key of one level is refused
    view.get(createTable(blocksInSocial), [""]);
  });
});
