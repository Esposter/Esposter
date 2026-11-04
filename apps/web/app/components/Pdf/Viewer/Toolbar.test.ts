// @vitest-environment happy-dom
import type { PdfViewerState } from "vue-pdfjs-headless";

import { createPdfViewerState } from "@/components/Pdf/Viewer/createPdfViewerState.fixture";
import PdfViewerToolbar from "@/components/Pdf/Viewer/Toolbar.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import { PDF_ROTATION_STEP } from "vue-pdfjs-headless";

const mountToolbar = ({
  isFullscreen = false,
  isSidebarOpen = true,
  viewer = createPdfViewerState(),
}: { isFullscreen?: boolean; isSidebarOpen?: boolean; viewer?: PdfViewerState } = {}) =>
  mount(PdfViewerToolbar, {
    props: {
      filename: "report.pdf",
      isFullscreen,
      isSidebarOpen,
      "onUpdate:isSidebarOpen": vi.fn<(isOpen: boolean) => void>(),
      viewer,
    },
  });
// The overflow menu opens from its trigger's arrow key, as a reader's does, and its items are read from the menu
const openMenu = async (component: ReturnType<typeof mountToolbar>) => {
  await component.get('[aria-label="PDF actions"]').trigger("keydown", { key: "ArrowDown" });

  return component;
};
const getMenuItem = (component: ReturnType<typeof mountToolbar>, title: string) =>
  component.findAll('[role^="menuitem"]').find((item) => item.text() === title);

describe("pdfViewerToolbar", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("the sidebar toggle is pressed while the sidebar is open, and shuts it when pressed", async () => {
      expect.hasAssertions();

      const component = mountToolbar({ isSidebarOpen: true });
      const toggle = component.get('[aria-label="Sidebar"]');
      await toggle.trigger("click");

      expect(toggle.attributes("aria-pressed")).toBe("true");
      expect(component.emitted("update:isSidebarOpen")).toStrictEqual([[false]]);
    });

    test("rotating right", async () => {
      expect.hasAssertions();

      const viewer = createPdfViewerState();
      const component = await openMenu(mountToolbar({ viewer }));
      await getMenuItem(component, "Rotate right")?.trigger("click");

      expect(viewer.rotate).toHaveBeenCalledExactlyOnceWith(PDF_ROTATION_STEP);
    });

    test("rotating left", async () => {
      expect.hasAssertions();

      const viewer = createPdfViewerState();
      const component = await openMenu(mountToolbar({ viewer }));
      await getMenuItem(component, "Rotate left")?.trigger("click");

      expect(viewer.rotate).toHaveBeenCalledExactlyOnceWith(-PDF_ROTATION_STEP);
    });

    test("the full screen item reads Exit full screen while the viewer is full screen", async () => {
      expect.hasAssertions();

      const component = await openMenu(mountToolbar({ isFullscreen: true }));

      expect(getMenuItem(component, "Exit full screen")).toBeDefined();
      expect(getMenuItem(component, "Full screen")).toBeUndefined();
    });

    test("download with watermark asks for the text rather than saving", async () => {
      expect.hasAssertions();

      const viewer = createPdfViewerState();
      const component = await openMenu(mountToolbar({ viewer }));
      await getMenuItem(component, "Download with watermark")?.trigger("click");
      await flushPromises();

      expect(component.emitted("watermark")).toHaveLength(1);
      expect(viewer.download).not.toHaveBeenCalled();
    });

    test("match case is marked while it is on, and choosing it turns it off", async () => {
      expect.hasAssertions();

      const isMatchCase = ref(true);
      const component = await openMenu(mountToolbar({ viewer: createPdfViewerState({ isMatchCase }) }));

      expect(getMenuItem(component, "Match case")?.attributes("aria-checked")).toBe("true");

      await getMenuItem(component, "Match case")?.trigger("click");

      expect(isMatchCase.value).toBe(false);
    });

    test("matching whole words", async () => {
      expect.hasAssertions();

      const isWholeWord = ref(false);
      const component = await openMenu(mountToolbar({ viewer: createPdfViewerState({ isWholeWord }) }));
      await getMenuItem(component, "Whole word")?.trigger("click");

      expect(isWholeWord.value).toBe(true);
    });

    test("going to a page", async () => {
      expect.hasAssertions();

      const viewer = createPdfViewerState();
      const component = mountToolbar({ viewer });
      await component.get('input[type="number"]').setValue("4");
      await component.get("form").trigger("submit");
      await flushPromises();

      expect(viewer.goToPage).toHaveBeenCalledExactlyOnceWith(4);
    });

    test("zooming past the largest scale", () => {
      expect.hasAssertions();

      const component = mountToolbar({ viewer: createPdfViewerState({ isZoomInDisabled: computed(() => true) }) });

      expect(component.get('[aria-label="Zoom in"]').attributes("disabled")).toBeDefined();
    });

    test("resetting a zoomed document", async () => {
      expect.hasAssertions();

      const viewer = createPdfViewerState();
      const component = mountToolbar({ viewer });
      await component.get('[aria-label="Zoom 125%, reset"]').trigger("click");

      expect(component.get('[aria-label="Zoom 125%, reset"]').text()).toBe("125%");
      expect(viewer.fitWidth).toHaveBeenCalledExactlyOnceWith();
    });

    test("zooming out at the smallest scale", () => {
      expect.hasAssertions();

      const component = mountToolbar({ viewer: createPdfViewerState({ isZoomOutDisabled: computed(() => true) }) });

      expect(component.get('[aria-label="Zoom out"]').attributes("disabled")).toBeDefined();
    });

    test("the page controls are unavailable until a document opens", () => {
      expect.hasAssertions();

      const component = mountToolbar({ viewer: createPdfViewerState({ pagesCount: ref(0) }) });

      expect(component.get('[aria-label="Next page"]').attributes("disabled")).toBeDefined();
      expect(component.get('[aria-label="Zoom in"]').attributes("disabled")).toBeDefined();
    });
  });
});
