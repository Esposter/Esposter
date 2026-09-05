import { NavigationTrailPage } from "@/models/shared/NavigationTrailPage";
import { getNextNavigationTrail } from "@/services/shared/getNextNavigationTrail";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { reactive } from "vue";

describe(getNextNavigationTrail, () => {
  const resourcePath = RoutePath.Resource("id");
  const otherResourcePath = RoutePath.Resource("otherId");
  const bladePath = `${resourcePath}/data`;

  test("appends the page drilled in from", () => {
    expect.hasAssertions();

    expect(getNextNavigationTrail(RoutePath.ResourceExplorer, RoutePath.ResourceExplorerAll, [])).toStrictEqual([
      NavigationTrailPage.Resources,
    ]);
    expect(
      getNextNavigationTrail(RoutePath.ResourceExplorerAll, resourcePath, [NavigationTrailPage.Resources]),
    ).toStrictEqual([NavigationTrailPage.Resources, NavigationTrailPage.All]);
    // The list opened directly is still a page the visitor navigated through, so it is still the one crumb
    expect(getNextNavigationTrail(RoutePath.ResourceExplorerAll, resourcePath, [])).toStrictEqual([
      NavigationTrailPage.All,
    ]);
  });

  // A resource reached from a favourite, from search or from a link has nothing above it — the crumb and the
  // List rail both hang off this being empty. Leaving the area is what emptied the trail on the way out
  test("leaves no trail on a direct arrival", () => {
    expect.hasAssertions();

    expect(getNextNavigationTrail(RoutePath.Index, resourcePath, [])).toStrictEqual([]);
    expect(getNextNavigationTrail(RoutePath.Index, RoutePath.ResourceExplorerAll, [])).toStrictEqual([]);
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

    expect(getNextNavigationTrail(RoutePath.ResourceExplorerAll, RoutePath.ResourceExplorerAll, [])).toStrictEqual([]);
    expect(
      getNextNavigationTrail(RoutePath.ResourceExplorerAll, RoutePath.ResourceExplorerAll, [
        NavigationTrailPage.Resources,
      ]),
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

  // The plugin writes what comes back onto the history entry, and the browser structured-clones it. The trail it
  // Passes in is the store's own reactive array, so a branch that returns it untouched puts a proxy in front of
  // The serializer — a DataCloneError that rejects the very navigation the trail is being recorded for
  test("returns a trail the history entry can hold", () => {
    expect.hasAssertions();

    const trail = reactive([NavigationTrailPage.Resources, NavigationTrailPage.All]);

    expect(structuredClone(getNextNavigationTrail(resourcePath, otherResourcePath, trail))).toStrictEqual([
      NavigationTrailPage.Resources,
      NavigationTrailPage.All,
    ]);
  });

  test("truncates to a page the trail already holds", () => {
    expect.hasAssertions();

    expect(
      getNextNavigationTrail(resourcePath, RoutePath.ResourceExplorerAll, [
        NavigationTrailPage.Resources,
        NavigationTrailPage.All,
      ]),
    ).toStrictEqual([NavigationTrailPage.Resources]);
  });

  test("ends the trail at the landing page", () => {
    expect.hasAssertions();

    expect(
      getNextNavigationTrail(RoutePath.ResourceExplorerAll, RoutePath.ResourceExplorer, [
        NavigationTrailPage.Resources,
      ]),
    ).toStrictEqual([]);
  });

  test("carries no trail out of the area", () => {
    expect.hasAssertions();

    expect(
      getNextNavigationTrail(RoutePath.ResourceExplorerAll, RoutePath.MessagesFriends, [NavigationTrailPage.All]),
    ).toStrictEqual([]);
    // A sibling route that merely shares the prefix is a different area, not a page inside this one
    expect(
      getNextNavigationTrail(RoutePath.ResourceExplorerAll, `${RoutePath.ResourceExplorer}-archive`, [
        NavigationTrailPage.All,
      ]),
    ).toStrictEqual([]);
  });
});
