import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { User } from "@esposter/db-schema";
import type { BinaryOperator as DrizzleBinaryOperator } from "drizzle-orm";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { StorageTier, users } from "@esposter/db-schema";
import { and, eq, gt, gte, lt, lte, or } from "drizzle-orm";
import { describe, expect, test } from "vitest";

describe(getCursorWhere, () => {
  const createdAt = new Date();
  const user: User = {
    biography: "",
    createdAt,
    deletedAt: null,
    email: "",
    emailVerified: false,
    id: crypto.randomUUID(),
    image: "",
    name: "",
    storageBytesUsed: 0,
    storageTier: StorageTier.Free,
    updatedAt: createdAt,
  };
  const sortItems: [string, SortItem<keyof User> & { operator: DrizzleBinaryOperator }][] = [
    ["ascending", { key: "id", operator: gt, order: SortOrder.Asc }],
    [
      "ascending, including the cursor's own row",
      { isIncludeValue: true, key: "id", operator: gte, order: SortOrder.Asc },
    ],
    ["descending", { key: "id", operator: lt, order: SortOrder.Desc }],
    [
      "descending, including the cursor's own row",
      { isIncludeValue: true, key: "id", operator: lte, order: SortOrder.Desc },
    ],
  ];

  test.each(sortItems)("compares %s", (_, sortItem) => {
    expect.hasAssertions();

    const serializedCursors = serialize(user, [sortItem]);

    expect(getCursorWhere(users, serializedCursors, [sortItem])).toStrictEqual(
      or(and(sortItem.operator(users.id, user.id))),
    );
  });

  test("gets lexicographic where for compound sort", () => {
    expect.hasAssertions();

    const sortBy: SortItem<keyof User>[] = [
      { key: "createdAt", order: SortOrder.Desc },
      { key: "id", order: SortOrder.Desc },
    ];
    const serializedCursors = serialize(user, sortBy);

    expect(getCursorWhere(users, serializedCursors, sortBy)).toStrictEqual(
      or(and(lt(users.createdAt, user.createdAt)), and(eq(users.createdAt, user.createdAt), lt(users.id, user.id))),
    );
  });
});
