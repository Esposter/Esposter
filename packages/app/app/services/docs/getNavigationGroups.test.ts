import type { ContentNavigationItem } from "@nuxt/content";

import { DocsNavigationSlug } from "@/models/docs/DocsNavigationSlug";
import { getNavigationGroups } from "@/services/docs/getNavigationGroups";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createItem = (path: string): ContentNavigationItem => ({
  path,
  title: path.split("/").at(-1) ?? "",
});

describe(getNavigationGroups, () => {
  test("unmapped section keeps feature pages ungrouped and trails planning pages", () => {
    expect.hasAssertions();

    const sectionPath = `${RoutePath.Docs}/a`;
    const groups = getNavigationGroups(sectionPath, [
      createItem(`${sectionPath}/b`),
      createItem(`${sectionPath}/${DocsNavigationSlug.Roadmap}`),
      createItem(`${sectionPath}/${DocsNavigationSlug.Deferred}`),
      createItem(`${sectionPath}/${DocsNavigationSlug.Rejected}`),
    ]);

    expect(groups.map(({ items, title }) => ({ paths: items.map(({ path }) => path), title }))).toStrictEqual([
      { paths: [`${sectionPath}/b`], title: undefined },
      {
        paths: [
          `${sectionPath}/${DocsNavigationSlug.Roadmap}`,
          `${sectionPath}/${DocsNavigationSlug.Deferred}`,
          `${sectionPath}/${DocsNavigationSlug.Rejected}`,
        ],
        title: "Planning",
      },
    ]);
  });

  test("mapped section orders groups by declaration order with unmapped pages leading", () => {
    expect.hasAssertions();

    // "virrun" and its "architecture"/"cache" slugs are real DocsSectionGroupsMap keys the code owns
    const sectionPath = `${RoutePath.Docs}/virrun`;
    const groups = getNavigationGroups(sectionPath, [
      createItem(`${sectionPath}/cache`),
      createItem(`${sectionPath}/architecture`),
      createItem(`${sectionPath}/a`),
    ]);

    expect(groups.map(({ items, title }) => ({ paths: items.map(({ path }) => path), title }))).toStrictEqual([
      { paths: [`${sectionPath}/a`], title: undefined },
      { paths: [`${sectionPath}/architecture`], title: "Core" },
      { paths: [`${sectionPath}/cache`], title: "Performance" },
    ]);
  });

  test("returns no groups for no items", () => {
    expect.hasAssertions();

    expect(getNavigationGroups(`${RoutePath.Docs}/a`, [])).toStrictEqual([]);
  });
});
