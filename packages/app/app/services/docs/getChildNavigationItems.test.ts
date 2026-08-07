import type { ContentNavigationItem } from "@nuxt/content";

import { getChildNavigationItems } from "@/services/docs/getChildNavigationItems";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createItem = (path: string): ContentNavigationItem => ({
  path,
  title: path.split("/").at(-1) ?? "",
});

describe(getChildNavigationItems, () => {
  test("drops the directory's own index child", () => {
    expect.hasAssertions();

    const path = `${RoutePath.Docs}/a`;
    const children = getChildNavigationItems({
      ...createItem(path),
      children: [createItem(path), createItem(`${path}/b`)],
    });

    expect(children.map((child) => child.path)).toStrictEqual([`${path}/b`]);
  });

  test("returns no items for a leaf page", () => {
    expect.hasAssertions();

    expect(getChildNavigationItems(createItem(`${RoutePath.Docs}/a`))).toStrictEqual([]);
  });
});
