// @vitest-environment happy-dom
import UiIcon from "@/components/Ui/Icon.vue";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiIcon", () => {
  test("hides an unlabelled icon from assistive technology", () => {
    expect.hasAssertions();

    const component = mount(UiIcon, { props: { meaning: UiIconMeaning.Success } });

    expect(component.attributes("aria-hidden")).toBe("true");
    expect(component.attributes("role")).toBeUndefined();
  });

  test("names a labelled icon as an image", () => {
    expect.hasAssertions();

    const label = "label";
    const component = mount(UiIcon, { props: { label, meaning: UiIconMeaning.Success } });

    expect(component.attributes("aria-hidden")).toBeUndefined();
    expect(component.attributes("aria-label")).toBe(label);
    expect(component.attributes("role")).toBe("img");
  });
});
