import { NavigationTrailPage } from "@/models/shared/NavigationTrailPage";
import { getNextNavigationTrail } from "@/services/shared/getNextNavigationTrail";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getNextNavigationTrail, () => {
  const resourcePath = RoutePath.Resource("id");
  const bladePath = `${resourcePath}/data`;

  test("appends the page drilled in from", () => {
    expect.hasAssertions();

    expect(getNextNavigationTrail(RoutePath.ResourcesAll, resourcePath, [NavigationTrailPage.Resources])).toStrictEqual(
      [NavigationTrailPage.Resources, NavigationTrailPage.All],
    );
  });

  // A resource reached from a favourite, from search or from a link has nothing above it — the crumb and the
  // List rail both hang off this being empty
  test("leaves no trail on a direct arrival", () => {
    expect.hasAssertions();

    expect(getNextNavigationTrail(RoutePath.Index, resourcePath, [])).toStrictEqual([]);
  });

  test("carries the trail across a blade of the page already open", () => {
    expect.hasAssertions();

    expect(getNextNavigationTrail(resourcePath, bladePath, [NavigationTrailPage.All])).toStrictEqual([
      NavigationTrailPage.All,
    ]);
    // Blades are siblings of each other, not of the resource, so the carry cannot key on one path prefixing the other
    expect(getNextNavigationTrail(bladePath, `${resourcePath}/settings`, [NavigationTrailPage.All])).toStrictEqual([
      NavigationTrailPage.All,
    ]);
  });

  test("truncates to a page the trail already holds", () => {
    expect.hasAssertions();

    expect(
      getNextNavigationTrail(resourcePath, RoutePath.ResourcesAll, [
        NavigationTrailPage.Resources,
        NavigationTrailPage.All,
      ]),
    ).toStrictEqual([NavigationTrailPage.Resources]);
  });

  test("ends the trail at the landing page", () => {
    expect.hasAssertions();

    expect(
      getNextNavigationTrail(RoutePath.ResourcesAll, RoutePath.Resources, [NavigationTrailPage.Resources]),
    ).toStrictEqual([]);
  });

  test("carries no trail out of the area", () => {
    expect.hasAssertions();

    expect(
      getNextNavigationTrail(RoutePath.ResourcesAll, RoutePath.MessagesFriends, [NavigationTrailPage.All]),
    ).toStrictEqual([]);
  });
});
