// @vitest-environment nuxt
import StyledTooltipMenuIconButton from "@/components/Styled/Tooltip/MenuIconButton.vue";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("styledTooltipMenuIconButton", () => {
  const icon = "i-mdi:close";

  test("draws the icon when no activator slot is given", async () => {
    expect.hasAssertions();

    // VBtn draws `icon` only while it has no default slot, so a slot registered unconditionally would leave
    // Every icon call site with an empty button
    const component = await mountSuspended(StyledTooltipMenuIconButton, { props: { icon } });

    expect(component.find(`.v-btn [class~="${icon}"]`).exists()).toBe(true);
    expect(component.get(".v-btn").classes()).toContain("v-btn--icon");
  });

  test("draws the activator slot instead, in a button that is no longer icon-shaped", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledTooltipMenuIconButton, {
      slots: { activator: "<span>a</span>" },
    });

    expect(component.get(".v-btn").text()).toBe("a");
    expect(component.get(".v-btn").classes()).not.toContain("v-btn--icon");
  });

  test("routes a fallthrough attr to the button rather than the menu", async () => {
    expect.hasAssertions();

    // The root is VMenu, so an undeclared `to` lands on the popup element by default and the button never
    // Navigates
    const component = await mountSuspended(StyledTooltipMenuIconButton, {
      attrs: { to: RoutePath.ResourceExplorerAll },
      props: { icon },
    });

    expect(component.get(".v-btn").element.tagName).toBe("A");
  });
});
