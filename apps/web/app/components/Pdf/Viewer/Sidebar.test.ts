// @vitest-environment happy-dom
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PdfComment, PdfOutline } from "vue-pdfjs-headless";

import { createPdfAnnotationsState } from "@/components/Pdf/Viewer/createPdfAnnotationsState.test";
import { createPdfViewerState } from "@/components/Pdf/Viewer/createPdfViewerState.test";
import PdfViewerSidebar from "@/components/Pdf/Viewer/Sidebar.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { PdfSidebarTab } from "@/models/pdf/PdfSidebarTab";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// No card comes into view of the rail here, so no page is drawn and the document needs no page of its own
const createDocument = (numPages: number) =>
  ({ getPage: vi.fn<PDFDocumentProxy["getPage"]>(), numPages }) as unknown as PDFDocumentProxy;
const mountSidebar = (outline: PdfOutline | undefined = [], comments: PdfComment[] | undefined = []) =>
  mount(PdfViewerSidebar, {
    props: {
      annotations: createPdfAnnotationsState({ comments: shallowRef<PdfComment[] | undefined>(comments) }),
      pdfDocument: createDocument(6),
      tab: PdfSidebarTab.Outline,
      viewer: createPdfViewerState({ outline: shallowRef<PdfOutline | undefined>(outline) }),
    },
  });
const chooseTab = async (component: ReturnType<typeof mountSidebar>, title: string) => {
  await component
    .findAll('[role="tab"]')
    .find((tab) => tab.text() === title)
    ?.trigger("click");
  await flushPromises();
};

describe("pdfViewerSidebar", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        disconnect() {}
        observe() {}
        unobserve() {}
      },
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("switching the sidebar between the outline and the thumbnails", async () => {
      expect.hasAssertions();

      const component = mountSidebar([]);
      expect(component.text()).toContain("This PDF has no outline");

      await chooseTab(component, "Thumbnails");

      expect(component.text()).not.toContain("This PDF has no outline");
      expect(component.findAll("button").some((button) => button.text() === "Page 1")).toBe(true);
    });

    test("choosing a comment tells the dialog a page was chosen", async () => {
      expect.hasAssertions();

      const component = mountSidebar([], [{ contents: "a", pageNumber: 2 }]);
      await chooseTab(component, "Comments");
      await component
        .findAll("button")
        .find((button) => button.text() === "Page 2 a")
        ?.trigger("click");

      expect(component.emitted("chosePage")).toStrictEqual([[]]);
    });
  });
});
