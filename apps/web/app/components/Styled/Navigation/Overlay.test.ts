// @vitest-environment nuxt
import StyledNavigationOverlay from "@/components/Styled/Navigation/Overlay.vue";
import { RoutePath, takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("styledNavigationOverlay", () => {
  const items = [
    { icon: "", isActive: true, title: "", to: RoutePath.ResourceExplorer },
    { icon: "", isActive: false, title: "a", to: RoutePath.ResourceExplorerAll },
  ];

  test("renders nothing until it is opened", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledNavigationOverlay, { props: { items, modelValue: false } });

    expect(component.text()).toBe("");
  });

  // The drawer is navigation and nothing else, so the entry that was picked is also what closes it — leaving it
  // Open would sit over the page it just navigated to
  test("closes itself on the entry that was picked", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledNavigationOverlay, { props: { items, modelValue: true } });

    expect(component.text()).toBe("a");

    await takeOne(component.findAll("a")).trigger("click");

    expect(component.emitted("update:modelValue")).toStrictEqual([[false]]);
  });
});
