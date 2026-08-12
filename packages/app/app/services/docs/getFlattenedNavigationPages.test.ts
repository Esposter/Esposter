import { createNavigationItem } from "@/services/docs/createNavigationItem.test";
import { getFlattenedNavigationPages } from "@/services/docs/getFlattenedNavigationPages";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getFlattenedNavigationPages, () => {
  test("nested folder pages flatten after their folder overview, skipping self-index and pageless folders", () => {
    expect.hasAssertions();

    // "esbabbler" and its "calls" slug are real DocsSectionGroupsMap keys the code owns
    const sectionPath = `${RoutePath.Docs}/esbabbler`;
    const pages = getFlattenedNavigationPages([
      createNavigationItem(sectionPath, [
        createNavigationItem(`${sectionPath}/calls`, [
          createNavigationItem(`${sectionPath}/calls`),
          createNavigationItem(`${sectionPath}/calls/a`),
        ]),
        { ...createNavigationItem(`${sectionPath}/b`, [createNavigationItem(`${sectionPath}/b/a`)]), page: false },
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
      createNavigationItem(`${RoutePath.Docs}/a`, [createNavigationItem(`${RoutePath.Docs}/a/b`)]),
      createNavigationItem(`${RoutePath.Docs}/c`, [createNavigationItem(`${RoutePath.Docs}/c/d`)]),
    ]);

    expect(pages.map(({ path }) => path)).toStrictEqual([
      `${RoutePath.Docs}/a`,
      `${RoutePath.Docs}/a/b`,
      `${RoutePath.Docs}/c`,
      `${RoutePath.Docs}/c/d`,
    ]);
  });
});
