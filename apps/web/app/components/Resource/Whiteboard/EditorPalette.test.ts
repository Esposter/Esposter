// @vitest-environment nuxt
import ResourceWhiteboardEditorPalette from "@/components/Resource/Whiteboard/EditorPalette.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceWhiteboardEditorPalette", () => {
  test("the palette lists the flowchart shapes", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(ResourceWhiteboardEditorPalette);

    expect(wrapper.findAll("button").map((button) => button.attributes("aria-label"))).toStrictEqual([
      "Rectangle",
      "Ellipse",
      "Diamond",
      "Terminal",
      "Process",
      "Decision",
      "Input/Output",
      "Predefined Process",
      "Annotation",
      "Sticky note",
      "Text box",
    ]);
  });
});
