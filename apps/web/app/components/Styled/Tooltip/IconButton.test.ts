// @vitest-environment nuxt
import StyledTooltipIconButton from "@/components/Styled/Tooltip/IconButton.vue";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("styledTooltipIconButton", () => {
  test("routes a fallthrough attr to the button rather than the tooltip", async () => {
    expect.hasAssertions();

    // The root is VTooltip, so an undeclared `to` lands on the popup element by default and the button never
    // Navigates — every call site spells navigation this way
    const component = await mountSuspended(StyledTooltipIconButton, {
      attrs: { to: RoutePath.ResourceExplorerAll },
      props: { icon: "mdi-close" },
    });

    expect(component.get(".v-btn").element.tagName).toBe("A");
  });
});
