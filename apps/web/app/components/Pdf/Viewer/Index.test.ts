// @vitest-environment nuxt
import type { PDFDocumentProxy } from "pdfjs-dist";

import PdfViewer from "@/components/Pdf/Viewer/Index.vue";
import PdfViewerSidebar from "@/components/Pdf/Viewer/Sidebar.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import UiSpinner from "@/components/Ui/Spinner.vue";
import { UiStyles } from "@/models/ui/UiStyle";
import { loadPdfViewer } from "@/services/pdf/loadPdfViewer";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { usePdfViewer } from "vue-pdfjs-headless";

// The viewer's module never loads here unless a test settles it, so each test sees the dialog at the state its props give
vi.mock(import("@/services/pdf/loadPdfViewer"), () => ({
  loadPdfViewer: vi.fn<typeof loadPdfViewer>(() => new Promise(() => {})),
}));
// The sidebar's default follows the breakpoint, so a test says whether the screen is a phone's before the viewer mounts
const device = vi.hoisted(() => ({ isPhone: false }));
vi.mock(import("@/composables/ui/useUiDisplay"), async (importOriginal) => {
  const actual = await importOriginal();

  return { ...actual, useUiDisplay: () => ({ ...actual.useUiDisplay(), mdAndDown: shallowRef(device.isPhone) }) };
});
// The package's viewer is kept as it is and only watched, so a test reads the options the dialog hands it
vi.mock(import("vue-pdfjs-headless"), async (importOriginal) => {
  const actual = await importOriginal();

  return { ...actual, usePdfViewer: vi.fn<typeof actual.usePdfViewer>(actual.usePdfViewer) };
});

// The renderer's constructors are called with `new`, and each returns the part of the renderer the viewer calls.
// The find controller reports two matches for any search, and none for an empty query
const EventBus = function () {
  const listeners = new Map<string, ((event: unknown) => void)[]>();

  return {
    dispatch: (name: string, event: unknown) => {
      for (const listener of listeners.get(name) ?? []) listener(event);
    },
    on: (name: string, listener: (event: unknown) => void) => {
      listeners.set(name, [...(listeners.get(name) ?? []), listener]);
    },
  };
};
const PDFFindController = function ({ eventBus }: { eventBus: ReturnType<typeof EventBus> }) {
  eventBus.on("find", (event: unknown) => {
    const total = (event as { query: string }).query === "" ? 0 : 2;

    eventBus.dispatch("updatefindmatchescount", { matchesCount: { current: total > 0 ? 1 : 0, total } });
  });
};
const PDFLinkService = function () {
  return { setDocument: noop, setViewer: noop };
};
const PDFViewer = function () {
  return { setDocument: noop };
};
type ViewerModule = Awaited<ReturnType<typeof loadPdfViewer>>;
// The renderer's viewer module, with the four constructors the viewer is built from and the target its links open in
const createViewerModule = () =>
  ({ EventBus, LinkTarget: { BLANK: 2 }, PDFFindController, PDFLinkService, PDFViewer }) as unknown as ViewerModule;
// A page with no annotations, which is what its comments are read from
const createPage = () => ({ cleanup: () => true, getAnnotations: () => Promise.resolve([]) });
// The document the viewer reads as it loads: six pages, and no outline. A test that reads its comments passes its pages
const createDocument = (
  getPage = vi.fn<(pageNumber: number) => Promise<unknown>>(() => Promise.resolve(createPage())),
) =>
  ({
    annotationStorage: new Map(),
    getOutline: () => Promise.resolve(null),
    getPage,
    numPages: 6,
  }) as unknown as PDFDocumentProxy;

// The viewer's state is the package's, so this file asserts the dialog's own part: the failure, the password prompt
// The password is handed back to the document, and a document is passed only by a test that shows its pages
const mountViewer = (props: {
  highlightTerms?: string[];
  isFailed?: boolean;
  isPasswordRequested?: boolean;
  isPasswordWrong?: boolean;
  pdfDocument?: PDFDocumentProxy;
}) =>
  mountSuspended(PdfViewer, {
    props: { filename: "report.pdf", isFailed: false, isPasswordRequested: false, isPasswordWrong: false, ...props },
  });

describe("pdfViewer", () => {
  beforeEach(() => {
    device.isPhone = false;
  });
  afterEach(() => {
    localStorage.clear();
  });

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    // The viewer loads its own module as it mounts, and a viewer whose module never came draws no page either
    test("a viewer whose module fails to load says so", async () => {
      expect.hasAssertions();

      const error = new Error("a");
      vi.mocked(loadPdfViewer).mockRejectedValueOnce(error);
      const consoleError = vi.spyOn(console, "error").mockImplementation(noop);
      const component = await mountViewer({});
      await flushPromises();

      expect(component.text()).toContain("The PDF could not be loaded.");
      expect(consoleError).toHaveBeenCalledExactlyOnceWith(error);
    });

    test("a PDF that fails to load says so in place of its pages", async () => {
      expect.hasAssertions();

      const component = await mountViewer({ isFailed: true });

      expect(component.text()).toContain("The PDF could not be loaded.");
      expect(component.find('input[type="password"]').exists()).toBe(false);
    });

    test("a document still loading shows the spinner", async () => {
      expect.hasAssertions();

      const component = await mountViewer({});

      expect(component.findComponent(UiSpinner).exists()).toBe(true);
    });

    test("a password request shows the prompt in place of the spinner", async () => {
      expect.hasAssertions();

      const component = await mountViewer({ isPasswordRequested: true });

      expect(component.findComponent(UiSpinner).exists()).toBe(false);
    });

    test("a wrong password says so", async () => {
      expect.hasAssertions();

      const component = await mountViewer({ isPasswordRequested: true, isPasswordWrong: true });

      expect(component.text()).toContain("The password is wrong.");
    });

    test("opening a PDF with search terms shows them in the search bar with the match count", async () => {
      expect.hasAssertions();

      vi.mocked(loadPdfViewer).mockResolvedValueOnce(createViewerModule());
      const component = await mountViewer({ highlightTerms: ["invoice", "total"], pdfDocument: createDocument() });
      await flushPromises();

      expect(component.get<HTMLInputElement>('[role="search"] input').element.value).toBe("invoice total");
      expect(component.get('[role="search"] [aria-live="polite"]').text()).toBe("1 of 2");
    });

    test("opening a PDF without search terms", async () => {
      expect.hasAssertions();

      await mountViewer({});

      expect(toValue(vi.mocked(usePdfViewer).mock.lastCall?.[0].highlightTerms)).toStrictEqual([]);
    });

    test("the password is handed back to the document", async () => {
      expect.hasAssertions();

      const component = await mountViewer({ isPasswordRequested: true });
      await component.find('input[type="password"]').setValue("secret");
      await component
        .findAll("form")
        .find((form) => form.find('input[type="password"]').exists())
        ?.trigger("submit");
      await flushPromises();

      expect(component.emitted("submitPassword")).toStrictEqual([["secret"]]);
    });

    test("a wide screen starts with the sidebar open", async () => {
      expect.hasAssertions();

      const component = await mountViewer({});

      expect(component.find('[role="tablist"]').exists()).toBe(true);
    });

    test("a phone starts with the sidebar closed", async () => {
      expect.hasAssertions();

      device.isPhone = true;
      const component = await mountViewer({});

      expect(component.find('[role="tablist"]').exists()).toBe(false);
    });

    test("the reader's sidebar choice is remembered", async () => {
      expect.hasAssertions();

      const first = await mountViewer({});
      await first
        .findAll('[role="tab"]')
        .find((tab) => tab.text() === "Thumbnails")
        ?.trigger("click");
      await first.get('[aria-label="Sidebar"]').trigger("click");
      first.unmount();
      const second = await mountViewer({});

      expect(second.find('[role="tablist"]').exists()).toBe(false);

      await second.get('[aria-label="Sidebar"]').trigger("click");
      await flushPromises();

      expect(
        second
          .findAll('[role="tab"]')
          .find((tab) => tab.text() === "Thumbnails")
          ?.attributes("aria-selected"),
      ).toBe("true");
    });

    test("the sidebar covers the pages on a phone", async () => {
      expect.hasAssertions();

      device.isPhone = true;
      const component = await mountViewer({});
      await component.get('[aria-label="Sidebar"]').trigger("click");
      await flushPromises();
      // Layout is not drawn here, so this asserts the overlay's placement rather than its geometry
      // The sidebar is out of the row of pages and pinned to the start edge, and the pages keep the row's flexible box
      const sidebar = component.get('[role="tablist"]').element.closest("[absolute]");

      expect(sidebar?.hasAttribute("start-0")).toBe(true);
      expect(component.get(".pdfViewer").element.parentElement?.parentElement?.hasAttribute("flex-1")).toBe(true);
    });

    test("choosing a page closes the sidebar on a phone", async () => {
      expect.hasAssertions();

      device.isPhone = true;
      const component = await mountViewer({});
      await component.get('[aria-label="Sidebar"]').trigger("click");
      // The outline and the thumbnails report a page chosen through the sidebar, which the dialog answers by closing it
      component.findComponent(PdfViewerSidebar).vm.$emit("chosePage");
      await flushPromises();

      expect(component.find('[role="tablist"]').exists()).toBe(false);
    });

    test("choosing a page keeps the sidebar open on a wide screen", async () => {
      expect.hasAssertions();

      const component = await mountViewer({});
      component.findComponent(PdfViewerSidebar).vm.$emit("chosePage");
      await flushPromises();

      expect(component.find('[role="tablist"]').exists()).toBe(true);
    });

    test("the comments are read only once the Comments tab is opened", async () => {
      expect.hasAssertions();

      const getPage = vi.fn<(pageNumber: number) => Promise<unknown>>(() => Promise.resolve(createPage()));
      const component = await mountViewer({ pdfDocument: createDocument(getPage) });
      await flushPromises();

      expect(getPage).not.toHaveBeenCalled();

      await component
        .findAll('[role="tab"]')
        .find((tab) => tab.text() === "Comments")
        ?.trigger("click");
      await flushPromises();

      expect(getPage).toHaveBeenCalledWith(1);
    });
  });
});
