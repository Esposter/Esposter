// @vitest-environment nuxt
import ResourceSurveyCreatorCanvasEditableText from "#src/components/Resource/Survey/Creator/Canvas/EditableText.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceSurveyCreatorCanvasEditableText", () => {
  test("escape restores the title", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSurveyCreatorCanvasEditableText, {
      props: { label: "Title", modelValue: "first" },
    });
    await component.get("span").trigger("click");
    await component.get("input").setValue("second");
    await component.get("input").trigger("keydown", { key: "Escape" });

    expect(component.get("span").text()).toBe("first");
    expect(component.emitted("update:modelValue")).toBeUndefined();
  });
});
