// @vitest-environment happy-dom
import UiIconButton from "@/components/Ui/IconButton.vue";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiIconButton", () => {
  test("draws its shortcut in its tooltip, beside its label", () => {
    expect.hasAssertions();

    const label = "label";
    const shortcut = "s";
    const component = mount(UiIconButton, { props: { label, meaning: UiIconMeaning.Save, shortcut } });

    expect(component.get('[role="tooltip"] kbd').text()).toBe("S");
  });
});
