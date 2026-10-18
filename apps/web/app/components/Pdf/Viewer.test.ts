// @vitest-environment nuxt
import type { PDFDocumentLoadingTask } from "pdfjs-dist";

import PdfViewer from "@/components/Pdf/Viewer.vue";
import { PDF_ROTATION_STEP } from "@/services/pdf/constants";
import { loadPdfDocument } from "@/services/pdf/loadPdfDocument";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

// The renderer's viewer components stand in for their real ones, which need a canvas and a worker. Each stub records
// The last instance made, so a test can read what the toolbar told it to do
const pdfjsStubs = vi.hoisted(() => {
  class EventBusStub {
    static last: EventBusStub | undefined;
    dispatch = vi.fn<(name: string, data: object) => void>();
    listeners = new Map<string, (event: unknown) => void>();

    constructor() {
      EventBusStub.last = this;
    }

    on(name: string, listener: (event: unknown) => void) {
      this.listeners.set(name, listener);
    }
  }
  class PdfJsViewerStub {
    static last: PdfJsViewerStub | undefined;
    currentPageNumber = 0;
    currentScaleValue = "auto";
    pagesRotation = 0;

    constructor() {
      PdfJsViewerStub.last = this;
    }

    decreaseScale = vi.fn();
    increaseScale = vi.fn();
    nextPage = vi.fn();
    previousPage = vi.fn();
    setDocument = vi.fn();
  }
  class LinkServiceStub {
    setDocument = vi.fn();
    setViewer = vi.fn();
  }
  class FindControllerStub {
    setDocument = vi.fn();
  }

  return { EventBusStub, FindControllerStub, LinkServiceStub, PdfJsViewerStub };
});

vi.mock("@/services/pdf/loadPdfDocument", () => ({ loadPdfDocument: vi.fn() }));
vi.mock("@/services/pdf/loadPdfViewer", () => ({
  loadPdfViewer: async () => ({
    EventBus: pdfjsStubs.EventBusStub,
    FindState: { NOT_FOUND: 1 },
    LinkTarget: { BLANK: 2 },
    PDFFindController: pdfjsStubs.FindControllerStub,
    PDFLinkService: pdfjsStubs.LinkServiceStub,
    PDFViewer: pdfjsStubs.PdfJsViewerStub,
  }),
}));
vi.mock(
  import("pdfjs-dist"),
  () => ({ PasswordResponses: { INCORRECT_PASSWORD: 2, NEED_PASSWORD: 1 } }) as unknown as typeof import("pdfjs-dist"),
);

describe("pdfViewer", () => {
  const filename = "document.pdf";
  const url = "/files/document.pdf";
  const PAGES_COUNT = 5;
  const PAGE_NUMBER = 3;
  const NEED_PASSWORD = 1;
  const INCORRECT_PASSWORD = 2;
  const MAX_SCALE = 10;
  const SEARCH_QUERY = "word";
  const CURRENT_MATCH = 1;
  const TOTAL_MATCHES = 3;
  const pdfPage = {
    getViewport: ({ scale }: { scale: number }) => ({ height: scale, width: scale }),
    render: () => ({ promise: Promise.resolve() }),
  };
  const pdfDocument = {
    getData: vi.fn(),
    getPage: vi.fn<(pageNumber: number) => Promise<typeof pdfPage>>(async () => pdfPage),
    numPages: PAGES_COUNT,
  };
  const destroy = vi.fn();
  const createTask = (promise: Promise<unknown>) =>
    ({ destroy, onPassword: vi.fn(), promise }) as unknown as PDFDocumentLoadingTask;
  const mountViewer = () => mountSuspended(PdfViewer, { attachTo: document.body, props: { filename, url } });
  const findButton = (component: Awaited<ReturnType<typeof mountViewer>>, label: string) =>
    component.findAll("button").find((button) => button.text() === label || button.attributes("aria-label") === label);

  afterEach(() => {
    document.body.innerHTML = "";
    destroy.mockClear();
    vi.restoreAllMocks();
  });

  // Closing the dialog during a password prompt unmounts the viewer, and the load it asked the password for stops
  test("#74 unmounting during a password prompt destroys the load", async () => {
    expect.hasAssertions();

    const task = createTask(new Promise(() => {}));
    vi.mocked(loadPdfDocument).mockResolvedValue(task);
    const component = await mountViewer();
    await flushPromises();
    task.onPassword(() => {}, NEED_PASSWORD);
    component.unmount();

    expect(destroy).toHaveBeenCalledOnce();
  });

  // Closing the dialog while the renderer is still being imported leaves no task to destroy yet, so the one that
  // arrives afterwards is destroyed on arrival
  test("Closing the viewer before its document arrives destroys it", async () => {
    expect.hasAssertions();

    const task = createTask(new Promise(() => {}));
    const { promise, resolve } = Promise.withResolvers<PDFDocumentLoadingTask>();
    vi.mocked(loadPdfDocument).mockReturnValue(promise);
    const component = await mountViewer();
    await flushPromises();
    component.unmount();
    resolve(task);
    await flushPromises();

    expect(destroy).toHaveBeenCalledOnce();
  });

  test("A protected PDF asks for its password", async () => {
    expect.hasAssertions();

    const task = createTask(new Promise(() => {}));
    vi.mocked(loadPdfDocument).mockResolvedValue(task);
    const component = await mountViewer();
    await flushPromises();
    task.onPassword(() => {}, NEED_PASSWORD);
    await flushPromises();

    expect(component.find('input[type="password"]').exists()).toBe(true);
  });

  test("A wrong password says so and asks again", async () => {
    expect.hasAssertions();

    const task = createTask(new Promise(() => {}));
    vi.mocked(loadPdfDocument).mockResolvedValue(task);
    const component = await mountViewer();
    await flushPromises();
    task.onPassword(() => {}, INCORRECT_PASSWORD);
    await flushPromises();

    expect(component.text()).toContain("The password is wrong.");
    expect(component.find('input[type="password"]').exists()).toBe(true);
  });

  test("A PDF that fails to load says so in place of its pages", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(loadPdfDocument).mockResolvedValue(createTask(Promise.reject(new Error("Missing"))));
    const component = await mountViewer();
    await flushPromises();

    expect(component.text()).toContain("could not be loaded");
  });

  test("Going to a page", async () => {
    expect.hasAssertions();

    vi.mocked(loadPdfDocument).mockResolvedValue(createTask(Promise.resolve(pdfDocument)));
    const component = await mountViewer();
    await flushPromises();
    await component.find('input[type="number"]').setValue(String(PAGE_NUMBER));
    await findButton(component, "Go")?.trigger("click");

    expect(pdfjsStubs.PdfJsViewerStub.last?.currentPageNumber).toBe(PAGE_NUMBER);
  });

  test("Zooming past the largest scale disables zoom in", async () => {
    expect.hasAssertions();

    vi.mocked(loadPdfDocument).mockResolvedValue(createTask(Promise.resolve(pdfDocument)));
    const component = await mountViewer();
    await flushPromises();
    pdfjsStubs.EventBusStub.last?.listeners.get("scalechanging")?.({ scale: MAX_SCALE });
    await flushPromises();

    expect(findButton(component, "Zoom in")?.attributes("disabled")).toBeDefined();
  });

  test("Searching for a word shows the match count", async () => {
    expect.hasAssertions();

    vi.mocked(loadPdfDocument).mockResolvedValue(createTask(Promise.resolve(pdfDocument)));
    const component = await mountViewer();
    await flushPromises();
    await component.find('input[type="search"]').setValue(SEARCH_QUERY);
    pdfjsStubs.EventBusStub.last?.listeners.get("updatefindmatchescount")?.({
      matchesCount: { current: CURRENT_MATCH, total: TOTAL_MATCHES },
    });
    await flushPromises();

    expect(pdfjsStubs.EventBusStub.last?.dispatch).toHaveBeenCalledWith(
      "find",
      expect.objectContaining({ query: SEARCH_QUERY }),
    );
    expect(component.text()).toContain(`${CURRENT_MATCH} of ${TOTAL_MATCHES}`);
  });

  test("Fit width, fit page and actual size set the scale", async () => {
    expect.hasAssertions();

    vi.mocked(loadPdfDocument).mockResolvedValue(createTask(Promise.resolve(pdfDocument)));
    const component = await mountViewer();
    await flushPromises();
    await findButton(component, "Fit width")?.trigger("click");

    expect(pdfjsStubs.PdfJsViewerStub.last?.currentScaleValue).toBe("page-width");
    await findButton(component, "Fit page")?.trigger("click");

    expect(pdfjsStubs.PdfJsViewerStub.last?.currentScaleValue).toBe("page-fit");
    await findButton(component, "Actual size")?.trigger("click");

    expect(pdfjsStubs.PdfJsViewerStub.last?.currentScaleValue).toBe("page-actual");
  });

  test("Rotating turns the pages a step", async () => {
    expect.hasAssertions();

    vi.mocked(loadPdfDocument).mockResolvedValue(createTask(Promise.resolve(pdfDocument)));
    const component = await mountViewer();
    await flushPromises();
    await findButton(component, "Rotate")?.trigger("click");

    expect(pdfjsStubs.PdfJsViewerStub.last?.pagesRotation).toBe(PDF_ROTATION_STEP);
  });

  test("Download saves the original bytes", async () => {
    expect.hasAssertions();

    vi.mocked(loadPdfDocument).mockResolvedValue(createTask(Promise.resolve(pdfDocument)));
    Object.assign(URL, {
      createObjectURL: vi.fn<(object: Blob) => string>(() => "blob:document"),
      revokeObjectURL: vi.fn<(url: string) => void>(),
    });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const component = await mountViewer();
    await flushPromises();
    await findButton(component, "Download")?.trigger("click");
    await flushPromises();

    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
  });

  test("Print renders each page and opens the print dialog", async () => {
    expect.hasAssertions();

    vi.mocked(loadPdfDocument).mockResolvedValue(createTask(Promise.resolve(pdfDocument)));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({} as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,");
    const print = vi.fn<() => void>();
    Object.assign(window, { print });
    const component = await mountViewer();
    await flushPromises();
    await findButton(component, "Print")?.trigger("click");
    await flushPromises();

    expect(pdfDocument.getPage).toHaveBeenCalledTimes(PAGES_COUNT);
    expect(print).toHaveBeenCalledOnce();
  });
});
