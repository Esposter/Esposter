import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { User } from "@esposter/db-schema";
import type { BinaryOperator as DrizzleBinaryOperator } from "drizzle-orm";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { BinaryOperator, users } from "@esposter/db-schema";
import { and, gt, gte, lt, lte } from "drizzle-orm";
import { describe, expect, test } from "vitest";

describe(getCursorWhere, () => {
  const createdAt = new Date();
  const user: User = {
    createdAt,
    deletedAt: null,
    email: "",
    emailVerified: false,
    id: crypto.randomUUID(),
    image: null,
    name: "",
    updatedAt: createdAt,
  };
  const binaryOperatorSortItemMap = {
    [BinaryOperator.ge]: { isIncludeValue: true, key: "id", operator: gte, order: SortOrder.Asc },
    [BinaryOperator.gt]: { key: "id", operator: gt, order: SortOrder.Asc },
    [BinaryOperator.le]: { isIncludeValue: true, key: "id", operator: lte, order: SortOrder.Desc },
    [BinaryOperator.lt]: { key: "id", operator: lt, order: SortOrder.Desc },
  } as const satisfies Partial<Record<BinaryOperator, SortItem<keyof User> & { operator: DrizzleBinaryOperator }>>;

  test("gets", () => {
    expect.hasAssertions();

    for (const sortItem of Object.values(binaryOperatorSortItemMap)) {
      const serializedCursors = serialize<User>(user, [sortItem]);

      expect(getCursorWhere(users, serializedCursors, [sortItem])).toStrictEqual(
        and(sortItem.operator(users.id, user.id)),
      );
    }
  });
});
