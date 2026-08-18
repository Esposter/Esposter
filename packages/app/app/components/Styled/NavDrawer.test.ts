// @vitest-environment nuxt
import StyledNavDrawer from "@/components/Styled/NavDrawer.vue";
import { RoutePath, takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("styledNavDrawer", () => {
  const items = [
    { icon: "mdi-home-outline", isActive: true, title: "Home", to: RoutePath.ResourceExplorer },
    { icon: "mdi-view-list-outline", isActive: false, title: "All", to: RoutePath.ResourceExplorerAll },
  ];

  test("renders nothing until it is opened", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledNavDrawer, { props: { items, modelValue: false } });

    expect(component.text()).toBe("");
  });

  // The drawer is navigation and nothing else, so the entry that was picked is also what closes it — leaving it
  // Open would sit over the page it just navigated to
  test("closes itself on the entry that was picked", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledNavDrawer, { props: { items, modelValue: true } });

    expect(component.text()).toContain("All");

    await takeOne(component.findAll("a")).trigger("click");

    expect(component.emitted("update:modelValue")).toStrictEqual([[false]]);
  });
});
