// @vitest-environment nuxt
import StyledTooltipIconButton from "@/components/Styled/Tooltip/IconButton.vue";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("styledTooltipIconButton", () => {
  const icon = "i-mdi:close";
  const text = "text";

  test("draws its icon in a button named by its text", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledTooltipIconButton, { props: { icon, text } });
    const button = component.get("button");

    expect(button.attributes("aria-label")).toBe(text);
    expect(button.find(`[class~="${icon}"]`).exists()).toBe(true);
  });

  test("goes somewhere as a link when given a route", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledTooltipIconButton, {
      props: { icon, text, to: RoutePath.ResourceExplorerAll },
    });

    expect(component.get("[ui-button]").element.tagName).toBe("A");
  });
});
