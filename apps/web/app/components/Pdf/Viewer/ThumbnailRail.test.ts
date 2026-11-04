// @vitest-environment happy-dom
import type { PDFDocumentProxy } from "pdfjs-dist";

import { createPdfViewerState } from "@/components/Pdf/Viewer/createPdfViewerState.test";
import PdfViewerThumbnailRail from "@/components/Pdf/Viewer/ThumbnailRail.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// No card comes into view of the rail here, so no page is drawn and the document needs no page of its own
const createDocument = (numPages: number) =>
  ({ getPage: vi.fn<PDFDocumentProxy["getPage"]>(), numPages }) as unknown as PDFDocumentProxy;
const mountRail = (currentPageNumber = 1) => {
  const viewer = createPdfViewerState({ currentPageNumber: ref(currentPageNumber) });
  const component = mount(PdfViewerThumbnailRail, { props: { pdfDocument: createDocument(6), viewer } });

  return { component, viewer };
};
const getCard = (component: ReturnType<typeof mountRail>["component"], pageNumber: number) =>
  component.findAll("button").find((button) => button.text() === `Page ${pageNumber}`);

describe("pdfViewerThumbnailRail", () => {
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
  });

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("a thumbnail not yet drawn holds its place", async () => {
      expect.hasAssertions();

      const { component } = mountRail();
      await flushPromises();

      expect(component.findAll("button")).toHaveLength(6);
      expect(getCard(component, 1)?.find("canvas").exists()).toBe(true);
    });

    test("choosing a thumbnail", async () => {
      expect.hasAssertions();

      const { component, viewer } = mountRail();
      await getCard(component, 4)?.trigger("click");

      expect(viewer.goToPage).toHaveBeenCalledExactlyOnceWith(4);
    });

    test("the page in view is marked", () => {
      expect.hasAssertions();

      const { component } = mountRail(2);

      expect(getCard(component, 2)?.attributes("aria-current")).toBe("true");
      expect(getCard(component, 3)?.attributes("aria-current")).toBeUndefined();
    });
  });
});
