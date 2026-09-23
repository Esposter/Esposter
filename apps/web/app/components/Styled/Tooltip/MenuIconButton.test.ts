// @vitest-environment nuxt
import StyledTooltipMenuIconButton from "@/components/Styled/Tooltip/MenuIconButton.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("styledTooltipMenuIconButton", () => {
  test("draws the icon when no activator slot is given", async () => {
    expect.hasAssertions();

    const icon = "i-mdi:close";
    const component = await mountSuspended(StyledTooltipMenuIconButton, { props: { icon } });

    expect(component.find(`button [class~="${icon}"]`).exists()).toBe(true);
  });

  test("draws the activator slot instead", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledTooltipMenuIconButton, { slots: { activator: "<span>a</span>" } });

    expect(component.get("button").text()).toBe("a");
  });
});
