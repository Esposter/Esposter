import { createNavigationItem } from "@/services/docs/createNavigationItem.test";
import { getChildNavigationItems } from "@/services/docs/getChildNavigationItems";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getChildNavigationItems, () => {
  test("drops the directory's own index child", () => {
    expect.hasAssertions();

    const path = `${RoutePath.Docs}/a`;
    const children = getChildNavigationItems({
      ...createNavigationItem(path),
      children: [createNavigationItem(path), createNavigationItem(`${path}/b`)],
    });

    expect(children.map((child) => child.path)).toStrictEqual([`${path}/b`]);
  });

  test("returns no items for a leaf page", () => {
    expect.hasAssertions();

    expect(getChildNavigationItems(createNavigationItem(`${RoutePath.Docs}/a`))).toStrictEqual([]);
  });
});
