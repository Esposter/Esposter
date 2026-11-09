// @vitest-environment nuxt
import ResourceWhiteboardEditorToolbar from "@/components/Resource/Whiteboard/EditorToolbar.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceWhiteboardEditorToolbar", () => {
  test("the toolbar offers no snap toggle", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(ResourceWhiteboardEditorToolbar);

    expect(wrapper.find('button[aria-label="Snap to grid"]').exists()).toBe(false);
  });
});
