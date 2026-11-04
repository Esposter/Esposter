// @vitest-environment happy-dom
import type { PdfAnnotationsState, PdfViewerState } from "vue-pdfjs-headless";

import { MimeType } from "#shared/models/file/MimeType";
import { createPdfAnnotationsState } from "@/components/Pdf/Viewer/createPdfAnnotationsState.fixture";
import { createPdfViewerState } from "@/components/Pdf/Viewer/createPdfViewerState.fixture";
import PdfViewerToolbar from "@/components/Pdf/Viewer/Toolbar.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { useAlertStore } from "@/store/alert";
import { downloadFile } from "@esposter/shared";
import { flushPromises, mount } from "@vue/test-utils";
import { err } from "neverthrow";
import { createPinia, setActivePinia, storeToRefs } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { PDF_ROTATION_STEP, PdfEditorMode } from "vue-pdfjs-headless";

vi.mock(import("@esposter/shared"), async (importOriginal) => ({
  ...(await importOriginal()),
  downloadFile: vi.fn<typeof downloadFile>(),
}));

const mountToolbar = ({
  annotations = createPdfAnnotationsState(),
  isSidebarOpen = true,
  viewer = createPdfViewerState(),
}: { annotations?: PdfAnnotationsState; isSidebarOpen?: boolean; viewer?: PdfViewerState } = {}) =>
  mount(PdfViewerToolbar, {
    props: {
      annotations,
      filename: "report.pdf",
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
// The picker is the input the dialog opens: its click is answered with the file the reader chose, and the types it takes
// Are returned, one per opening
const choosesFile = (file: File) => {
  const accepts: string[] = [];
  vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(function (this: HTMLInputElement) {
    accepts.push(this.accept);
    Object.defineProperty(this, "files", { value: [file] });
    this.dispatchEvent(new Event("change"));
  });

  return accepts;
};

describe("pdfViewerToolbar", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

    test("adding text is marked while it is on, and choosing it turns it off", async () => {
      expect.hasAssertions();

      const annotations = createPdfAnnotationsState();
      const viewer = createPdfViewerState({ editorMode: ref(PdfEditorMode.FreeText) });
      const component = await openMenu(mountToolbar({ annotations, viewer }));

      expect(getMenuItem(component, "Add text")?.attributes("aria-checked")).toBe("true");

      await getMenuItem(component, "Add text")?.trigger("click");

      expect(annotations.setEditorMode).toHaveBeenCalledExactlyOnceWith(PdfEditorMode.None);
    });

    test("adding text turns the editor mode on", async () => {
      expect.hasAssertions();

      const annotations = createPdfAnnotationsState();
      const component = await openMenu(mountToolbar({ annotations }));
      await getMenuItem(component, "Add text")?.trigger("click");

      expect(annotations.setEditorMode).toHaveBeenCalledExactlyOnceWith(PdfEditorMode.FreeText);
    });

    test("importing annotations hands the file's text to the composable", async () => {
      expect.hasAssertions();

      const annotations = createPdfAnnotationsState();
      const component = await openMenu(mountToolbar({ annotations }));
      const accepts = choosesFile(new File(["a"], "notes.xfdf"));
      await getMenuItem(component, "Import annotations")?.trigger("click");
      await flushPromises();

      expect(accepts).toStrictEqual([expect.stringContaining(MimeType.Xfdf)]);
      expect(annotations.importXfdf).toHaveBeenCalledExactlyOnceWith("a");
    });

    test("a refused import alerts once", async () => {
      expect.hasAssertions();

      const annotations = createPdfAnnotationsState({
        importXfdf: vi.fn<PdfAnnotationsState["importXfdf"]>(() => err("a")),
      });
      const alertStore = useAlertStore();
      const { alerts } = storeToRefs(alertStore);
      const component = await openMenu(mountToolbar({ annotations }));
      choosesFile(new File(["a"], "notes.xfdf"));
      await getMenuItem(component, "Import annotations")?.trigger("click");
      await flushPromises();

      expect(alerts.value.map(({ text }) => text)).toStrictEqual(["notes.xfdf: a"]);
    });

    test("exporting annotations downloads the XFDF under the document's name", async () => {
      expect.hasAssertions();

      const annotations = createPdfAnnotationsState({ exportXfdf: () => "<xfdf/>" });
      const component = await openMenu(mountToolbar({ annotations }));
      await getMenuItem(component, "Export annotations")?.trigger("click");

      expect(downloadFile).toHaveBeenCalledExactlyOnceWith("report.xfdf", "<xfdf/>", MimeType.Xfdf);
    });

    test("the annotation tools are unavailable until a document opens", async () => {
      expect.hasAssertions();

      const component = await openMenu(mountToolbar({ viewer: createPdfViewerState({ pagesCount: ref(0) }) }));

      expect(
        ["Add text", "Import annotations", "Export annotations"].map((title) =>
          getMenuItem(component, title)?.attributes("aria-disabled"),
        ),
      ).toStrictEqual(["true", "true", "true"]);
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
      expect(viewer.resetZoom).toHaveBeenCalledExactlyOnceWith();
    });

    test("the zoom readout is named before a document sets a scale", () => {
      expect.hasAssertions();

      const component = mountToolbar({ viewer: createPdfViewerState({ scale: ref(0) }) });

      expect(component.get('[aria-label="Reset zoom"]').text()).toBe("");
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
