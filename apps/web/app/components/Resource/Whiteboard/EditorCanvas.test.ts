// @vitest-environment nuxt
import ResourceWhiteboardEditorCanvas from "@/components/Resource/Whiteboard/EditorCanvas.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceWhiteboardEditorCanvas", () => {
  test("the canvas draws no grid", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(ResourceWhiteboardEditorCanvas);

    expect(wrapper.find("pattern").exists()).toBe(false);
  });
});
