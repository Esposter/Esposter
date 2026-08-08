// @vitest-environment nuxt
import AppBreadcrumbs from "@/components/App/Breadcrumbs.vue";
import { NavigationTrailPage } from "@/models/shared/NavigationTrailPage";
import { useNavigationTrailStore } from "@/store/navigationTrail";
import { RoutePath } from "@esposter/shared";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";
import { RouterLink } from "vue-router";

// `mountSuspended`'s `route` reaches the router that resolves the links, not the `useRoute()` the guard against
// Linking to the current page reads — so the path under test is set here
const { currentRoute } = vi.hoisted(() => ({ currentRoute: { path: "" } }));

mockNuxtImport("useRoute", () => () => currentRoute);

const readCrumbs = (element: Element) =>
  [...element.querySelectorAll(".v-breadcrumbs-item")].map((crumb) => crumb.textContent?.trim());

describe("appBreadcrumbs", () => {
  // A crumb is a real link, so the trail needs the real RouterLink — mountSuspended otherwise swaps in a stub
  const mountBreadcrumbs = (route: string, trail: NavigationTrailPage[]) => {
    const navigationTrailStore = useNavigationTrailStore();
    navigationTrailStore.setTrail(trail);
    currentRoute.path = route;
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

  // The page you are on is the title, never a crumb — and the hub is the one crumb that could link to itself
  test("renders nothing on the hub itself", async () => {
    expect.hasAssertions();

    const component = await mountBreadcrumbs(RoutePath.Resources, []);

    expect(component.find(".v-breadcrumbs-item").exists()).toBe(false);
  });
});
