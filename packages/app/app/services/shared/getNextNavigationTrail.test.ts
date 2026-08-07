import { NavigationTrailPage } from "@/models/shared/NavigationTrailPage";
import { getNextNavigationTrail } from "@/services/shared/getNextNavigationTrail";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getNextNavigationTrail, () => {
  const resourcePath = RoutePath.Resource("id");
  const otherResourcePath = RoutePath.Resource("otherId");
  const bladePath = `${resourcePath}/data`;

  test("appends the page drilled in from", () => {
    expect.hasAssertions();

    expect(getNextNavigationTrail(RoutePath.Resources, RoutePath.ResourcesAll, [])).toStrictEqual([
      NavigationTrailPage.Resources,
    ]);
    expect(getNextNavigationTrail(RoutePath.ResourcesAll, resourcePath, [NavigationTrailPage.Resources])).toStrictEqual(
      [NavigationTrailPage.Resources, NavigationTrailPage.All],
    );
    // The list opened directly is still a page the visitor navigated through, so it is still the one crumb
    expect(getNextNavigationTrail(RoutePath.ResourcesAll, resourcePath, [])).toStrictEqual([NavigationTrailPage.All]);
  });

  // A resource reached from a favourite, from search or from a link has nothing above it — the crumb and the
  // List rail both hang off this being empty. Leaving the area is what emptied the trail on the way out
  test("leaves no trail on a direct arrival", () => {
    expect.hasAssertions();

    expect(getNextNavigationTrail(RoutePath.Index, resourcePath, [])).toStrictEqual([]);
    expect(getNextNavigationTrail(RoutePath.Index, RoutePath.ResourcesAll, [])).toStrictEqual([]);
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

  // Every filter control on the list writes through useRouteQuery, so searching, sorting or paging is a real
  // Navigation whose from and to are the same page — which must not append the page the visitor is standing on
  test("carries the trail across a filter change on the page already open", () => {
    expect.hasAssertions();

    expect(getNextNavigationTrail(RoutePath.ResourcesAll, RoutePath.ResourcesAll, [])).toStrictEqual([]);
    expect(
      getNextNavigationTrail(RoutePath.ResourcesAll, RoutePath.ResourcesAll, [NavigationTrailPage.Resources]),
    ).toStrictEqual([NavigationTrailPage.Resources]);
  });

  // The list rail is the list the trail already records, so browsing it is moving around inside the same drill-in
  test("carries the trail across a row clicked in the list rail", () => {
    expect.hasAssertions();

    expect(
      getNextNavigationTrail(resourcePath, otherResourcePath, [NavigationTrailPage.Resources, NavigationTrailPage.All]),
    ).toStrictEqual([NavigationTrailPage.Resources, NavigationTrailPage.All]);
    expect(getNextNavigationTrail(bladePath, otherResourcePath, [NavigationTrailPage.All])).toStrictEqual([
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
    // A sibling route that merely shares the prefix is a different area, not a page inside this one
    expect(
      getNextNavigationTrail(RoutePath.ResourcesAll, `${RoutePath.Resources}-archive`, [NavigationTrailPage.All]),
    ).toStrictEqual([]);
  });
});
