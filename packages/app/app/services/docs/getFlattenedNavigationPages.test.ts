import type { ContentNavigationItem } from "@nuxt/content";

import { DocsNavigationSlug } from "@/models/docs/DocsNavigationSlug";
import { getFlattenedNavigationPages } from "@/services/docs/getFlattenedNavigationPages";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createItem = (path: string, children?: ContentNavigationItem[]): ContentNavigationItem => ({
  children,
  path,
  title: path.split("/").at(-1) ?? "",
});

describe(getFlattenedNavigationPages, () => {
  test("section overview leads, planning pages trail after feature pages", () => {
    expect.hasAssertions();

    // Children arrive pre-sorted by getSortedNavigationItems — features first, then roadmap, deferred
    const sectionPath = `${RoutePath.Docs}/a`;
    const pages = getFlattenedNavigationPages([
      createItem(sectionPath, [
        createItem(`${sectionPath}/b`),
        createItem(`${sectionPath}/${DocsNavigationSlug.Roadmap}`),
        createItem(`${sectionPath}/${DocsNavigationSlug.Deferred}`),
      ]),
    ]);

    expect(pages.map(({ path }) => path)).toStrictEqual([
      sectionPath,
      `${sectionPath}/b`,
      `${sectionPath}/${DocsNavigationSlug.Roadmap}`,
      `${sectionPath}/${DocsNavigationSlug.Deferred}`,
    ]);
  });

  test("mapped section walks groups in declaration order", () => {
    expect.hasAssertions();

    // "virrun" and its "architecture"/"cache" slugs are real DocsSectionGroupsMap keys the code owns
    const sectionPath = `${RoutePath.Docs}/virrun`;
    const pages = getFlattenedNavigationPages([
      createItem(sectionPath, [
        createItem(`${sectionPath}/cache`),
        createItem(`${sectionPath}/architecture`),
        createItem(`${sectionPath}/a`),
      ]),
    ]);

    expect(pages.map(({ path }) => path)).toStrictEqual([
      sectionPath,
      `${sectionPath}/a`,
      `${sectionPath}/architecture`,
      `${sectionPath}/cache`,
    ]);
  });

  test("nested folder pages flatten after their folder overview, skipping self-index and pageless folders", () => {
    expect.hasAssertions();

    // "esbabbler" and its "calls" slug are real DocsSectionGroupsMap keys the code owns
    const sectionPath = `${RoutePath.Docs}/esbabbler`;
    const pages = getFlattenedNavigationPages([
      createItem(sectionPath, [
        createItem(`${sectionPath}/calls`, [createItem(`${sectionPath}/calls`), createItem(`${sectionPath}/calls/a`)]),
        { ...createItem(`${sectionPath}/b`, [createItem(`${sectionPath}/b/a`)]), page: false },
      ]),
    ]);

    // The unmapped folder's pages lead the mapped Calls group
    expect(pages.map(({ path }) => path)).toStrictEqual([
      sectionPath,
      `${sectionPath}/b/a`,
      `${sectionPath}/calls`,
      `${sectionPath}/calls/a`,
    ]);
  });

  test("consecutive sections chain into one list", () => {
    expect.hasAssertions();

    const pages = getFlattenedNavigationPages([
      createItem(`${RoutePath.Docs}/a`, [createItem(`${RoutePath.Docs}/a/b`)]),
      createItem(`${RoutePath.Docs}/c`, [createItem(`${RoutePath.Docs}/c/d`)]),
    ]);

    expect(pages.map(({ path }) => path)).toStrictEqual([
      `${RoutePath.Docs}/a`,
      `${RoutePath.Docs}/a/b`,
      `${RoutePath.Docs}/c`,
      `${RoutePath.Docs}/c/d`,
    ]);
  });
});
