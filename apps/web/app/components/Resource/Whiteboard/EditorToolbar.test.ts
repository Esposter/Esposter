// @vitest-environment nuxt
import ResourceWhiteboardEditorToolbar from "@/components/Resource/Whiteboard/EditorToolbar.vue";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceWhiteboardEditorToolbar", () => {
  test("the grid can be turned off", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(ResourceWhiteboardEditorToolbar);
    await wrapper.find('button[aria-label="Snap to grid"]').trigger("click");
    const whiteboardEditorStore = useWhiteboardEditorStore();

    expect(whiteboardEditorStore.isSnapEnabled).toBe(false);
  });
});
