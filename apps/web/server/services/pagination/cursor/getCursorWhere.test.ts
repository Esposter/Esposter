import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { UserInAuth } from "@esposter/db-schema";
import type { BinaryOperator as DrizzleBinaryOperator } from "drizzle-orm";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { StorageTier, usersInAuth } from "@esposter/db-schema";
import { and, eq, gt, gte, lt, lte, or } from "drizzle-orm";
import { describe, expect, test } from "vitest";

describe(getCursorWhere, () => {
  const createdAt = new Date(0);
  const user: UserInAuth = {
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
  const sortItems: [string, SortItem<keyof UserInAuth> & { operator: DrizzleBinaryOperator }][] = [
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

  test.each(sortItems)("compares %s", (_title, sortItem) => {
    expect.hasAssertions();

    const serializedCursors = serialize(user, [sortItem]);

    expect(getCursorWhere(usersInAuth, serializedCursors, [sortItem])).toStrictEqual(
      or(and(sortItem.operator(usersInAuth.id, user.id))),
    );
  });

  test("gets lexicographic where for compound sort", () => {
    expect.hasAssertions();

    const sortBy: SortItem<keyof UserInAuth>[] = [
      { key: "createdAt", order: SortOrder.Desc },
      { key: "id", order: SortOrder.Desc },
    ];
    const serializedCursors = serialize(user, sortBy);

    expect(getCursorWhere(usersInAuth, serializedCursors, sortBy)).toStrictEqual(
      or(
        and(lt(usersInAuth.createdAt, user.createdAt)),
        and(eq(usersInAuth.createdAt, user.createdAt), lt(usersInAuth.id, user.id)),
      ),
    );
  });
});
