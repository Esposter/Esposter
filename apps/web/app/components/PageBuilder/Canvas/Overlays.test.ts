// @vitest-environment nuxt
import PageBuilderCanvasOverlays from "@/components/PageBuilder/Canvas/Overlays.vue";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("pageBuilderCanvasOverlays", () => {
  test("hovering a node outlines it", async () => {
    expect.hasAssertions();

    // A frame's animation frame runs at once here, so the outline is drawn before the assertion reads it
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    const element = document.createElement("div");
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue(new DOMRect(120, 40, 80, 20));
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, { content: [], root: { props: { lang: "en" } } });

    const component = await mountSuspended(PageBuilderCanvasOverlays, {
      props: { getElement: () => element, hoveredNodeId: TEST_ID, resourceId: TEST_ID, selectedNodeId: "" },
    });
    await nextTick();

    const outline = component.get("[data-outline='hover']").element as HTMLElement;
    expect(outline.style.left).toBe("120px");
    expect(outline.style.top).toBe("40px");
  });
});
