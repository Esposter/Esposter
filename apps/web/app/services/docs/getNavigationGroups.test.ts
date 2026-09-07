import { DocsNavigationSlug } from "@/models/docs/DocsNavigationSlug";
import { createNavigationItem } from "@/services/docs/createNavigationItem.test";
import { getNavigationGroups } from "@/services/docs/getNavigationGroups";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getNavigationGroups, () => {
  test("unmapped section keeps feature pages ungrouped and trails planning pages", () => {
    expect.hasAssertions();

    const sectionPath = `${RoutePath.Docs}/a`;
    const groups = getNavigationGroups(sectionPath, [
      createNavigationItem(`${sectionPath}/b`),
      createNavigationItem(`${sectionPath}/${DocsNavigationSlug.Roadmap}`),
      createNavigationItem(`${sectionPath}/${DocsNavigationSlug.Deferred}`),
      createNavigationItem(`${sectionPath}/${DocsNavigationSlug.Rejected}`),
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
      createNavigationItem(`${sectionPath}/cache`),
      createNavigationItem(`${sectionPath}/architecture`),
      createNavigationItem(`${sectionPath}/a`),
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
