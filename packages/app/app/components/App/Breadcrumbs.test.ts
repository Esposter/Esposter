// @vitest-environment nuxt
import AppBreadcrumbs from "@/components/App/Breadcrumbs.vue";
import { NavigationTrailPage } from "@/models/shared/NavigationTrailPage";
import { useNavigationTrailStore } from "@/store/navigationTrail";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";
import { RouterLink } from "vue-router";

const readCrumbs = (element: Element) =>
  [...element.querySelectorAll(".v-breadcrumbs-item")].map((crumb) => crumb.textContent?.trim());

describe("appBreadcrumbs", () => {
  // A crumb is a real link, so the trail needs the real RouterLink — mountSuspended otherwise swaps in a stub
  const mountBreadcrumbs = (route: string, trail: NavigationTrailPage[]) => {
    const navigationTrailStore = useNavigationTrailStore();
    navigationTrailStore.setTrail(trail);
    return mountSuspended(AppBreadcrumbs, { global: { components: { RouterLink } }, route });
  };

  test("leads a page reached with no trail behind it with the hub alone", async () => {
    expect.hasAssertions();

    const component = await mountBreadcrumbs(RoutePath.ResourcesAll, []);

    expect(readCrumbs(component.element)).toStrictEqual(["Resources"]);
  });

  test("does not repeat the hub a trail already carries", async () => {
    expect.hasAssertions();

    const component = await mountBreadcrumbs(RoutePath.ResourcesAll, [NavigationTrailPage.Resources]);

    expect(readCrumbs(component.element)).toStrictEqual(["Resources"]);
  });
});
// The hub dropping its own crumb on `/resources` is not covered here: `mountSuspended`'s `route` reaches the
// Router that resolves the links, not the `useRoute()` the guard reads, so the case can only be asserted by
// Mocking that composable — which would pin the mock rather than the component (see the `run-app` skill)
