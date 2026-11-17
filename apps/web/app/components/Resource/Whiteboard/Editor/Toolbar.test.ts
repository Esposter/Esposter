// @vitest-environment nuxt
import ResourceWhiteboardEditorToolbar from "#src/components/Resource/Whiteboard/Editor/Toolbar.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceWhiteboardEditorToolbar", () => {
  test("the toolbar offers no snap toggle", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(ResourceWhiteboardEditorToolbar);

    // The tools are drawn, so an empty toolbar cannot pass for one with no snap toggle
    expect(wrapper.find('button[aria-label="Freehand"]').exists()).toBe(true);
    expect(wrapper.find('button[aria-label="Snap to grid"]').exists()).toBe(false);
  });
});
