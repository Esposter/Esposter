import { DocsNavigationSlug } from "@/models/docs/DocsNavigationSlug";
import { PLANNING_GROUP_TITLE } from "@/services/docs/constants";
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
        title: PLANNING_GROUP_TITLE,
      },
    ]);
  });

  test("mapped section orders groups by declaration order with unmapped pages leading", () => {
    expect.hasAssertions();

    // "esbabbler" and its "messaging" and "moderation" slugs are real DocsSectionGroupsMap keys the code owns; moderation
    // comes first in the items, so only declaration order puts Messaging ahead of it
    const sectionPath = `${RoutePath.Docs}/esbabbler`;
    const groups = getNavigationGroups(sectionPath, [
      createNavigationItem(`${sectionPath}/moderation`),
      createNavigationItem(`${sectionPath}/messaging`),
      createNavigationItem(`${sectionPath}/a`),
    ]);

    expect(groups.map(({ items, title }) => ({ paths: items.map(({ path }) => path), title }))).toStrictEqual([
      { paths: [`${sectionPath}/a`], title: undefined },
      { paths: [`${sectionPath}/messaging`], title: "Messaging" },
      { paths: [`${sectionPath}/moderation`], title: "Moderation" },
    ]);
  });

  test("returns no groups for no items", () => {
    expect.hasAssertions();

    expect(getNavigationGroups(`${RoutePath.Docs}/a`, [])).toStrictEqual([]);
  });
});
