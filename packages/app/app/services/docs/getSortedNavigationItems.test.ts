import type { ContentNavigationItem } from "@nuxt/content";

import { DocsNavigationSlug } from "@/models/docs/DocsNavigationSlug";
import { getSortedNavigationItems } from "@/services/docs/getSortedNavigationItems";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createItem = (path: string, children?: ContentNavigationItem[]): ContentNavigationItem => ({
  children,
  path,
  title: path.split("/").at(-1) ?? "",
});

describe(getSortedNavigationItems, () => {
  test("sorts architecture first, areas alphabetically, proposals last", () => {
    expect.hasAssertions();

    const items = getSortedNavigationItems([
      createItem(`${RoutePath.Docs}/${DocsNavigationSlug.Proposals}`),
      createItem(`${RoutePath.Docs}/b`),
      createItem(`${RoutePath.Docs}/${DocsNavigationSlug.Architecture}`),
      createItem(`${RoutePath.Docs}/a`),
    ]);

    expect(items.map(({ path }) => path)).toStrictEqual([
      `${RoutePath.Docs}/${DocsNavigationSlug.Architecture}`,
      `${RoutePath.Docs}/a`,
      `${RoutePath.Docs}/b`,
      `${RoutePath.Docs}/${DocsNavigationSlug.Proposals}`,
    ]);
  });

  test("sorts area children as features, roadmap, deferred, rejected", () => {
    expect.hasAssertions();

    const areaPath = `${RoutePath.Docs}/a`;
    const items = getSortedNavigationItems([
      createItem(areaPath, [
        createItem(`${areaPath}/${DocsNavigationSlug.Rejected}`),
        createItem(`${areaPath}/${DocsNavigationSlug.Deferred}`),
        createItem(`${areaPath}/${DocsNavigationSlug.Roadmap}`),
        createItem(`${areaPath}/b`),
        createItem(`${areaPath}/a`),
      ]),
    ]);

    expect(items[0]?.children?.map(({ path }) => path)).toStrictEqual([
      `${areaPath}/a`,
      `${areaPath}/b`,
      `${areaPath}/${DocsNavigationSlug.Roadmap}`,
      `${areaPath}/${DocsNavigationSlug.Deferred}`,
      `${areaPath}/${DocsNavigationSlug.Rejected}`,
    ]);
  });

  test("does not throw when navigation items lack a title", () => {
    expect.hasAssertions();

    const items = getSortedNavigationItems([
      { path: `${RoutePath.Docs}/a` },
      { path: `${RoutePath.Docs}/b` },
    ] as ContentNavigationItem[]);

    expect(items.map(({ path }) => path)).toStrictEqual([`${RoutePath.Docs}/a`, `${RoutePath.Docs}/b`]);
  });
});
