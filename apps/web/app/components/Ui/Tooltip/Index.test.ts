// @vitest-environment happy-dom
import UiIconButton from "@/components/Ui/IconButton.vue";
import UiTooltip from "@/components/Ui/Tooltip/Index.vue";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { h } from "vue";

describe("uiTooltip", () => {
  const label = "label";

  test("draws its label as a manual popover, leaving the element's own type and state alone", () => {
    expect.hasAssertions();

    const component = mount(UiIconButton, {
      attrs: { disabled: true, type: "submit" },
      props: { label, meaning: UiIconMeaning.Remove },
    });
    const button = component.get("button");
    const tooltip = component.get('[role="tooltip"]');

    expect(button.attributes("type")).toBe("submit");
    expect(button.attributes("disabled")).toBe("");
    expect(button.attributes("aria-describedby")).toBeUndefined();
    expect(tooltip.attributes("popover")).toBe("manual");
    expect(tooltip.text()).toBe(label);
  });

  test("draws its content in place of its label", () => {
    expect.hasAssertions();

    const content = "content";
    const component = mount(UiTooltip, {
      props: { label },
      slots: { content: () => content, default: () => h("button") },
    });

    expect(component.get('[role="tooltip"]').text()).toBe(content);
  });
});
