// @vitest-environment nuxt
import type { FileEntity } from "@esposter/db-schema";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import type { PdfApi, PdfRenderer } from "vue-pdfjs-headless";

import { MimeType } from "#shared/models/file/MimeType";
import MessageModelFileRendererPdf from "@/components/Message/Model/FileRenderer/Pdf.vue";
import { loadPdfRenderer } from "@/services/pdf/loadPdfRenderer";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

// Neither the thumbnail nor the viewer draws in this file, which asserts the shell around them and when the dialog
// Exists. The renderer never loads, so the document is never requested and each component stays at its loading state
vi.mock(import("@/services/pdf/loadPdfRenderer"), () => ({
  loadPdfRenderer: vi.fn<typeof loadPdfRenderer>(() => new Promise(() => {})),
}));

describe("messageModelFileRendererPdf", () => {
  const filename = "filename";
  const file: Pick<FileEntity, "filename" | "hasThumbnail" | "id" | "isSpoiler" | "mimetype" | "size"> = {
    filename,
    hasThumbnail: false,
    id: crypto.randomUUID(),
    isSpoiler: false,
    mimetype: MimeType.Pdf,
    size: 1,
  };
  const url = "/document.pdf";
  const mountPdf = (isPreview: boolean, mountedUrl = "") =>
    mountSuspended(MessageModelFileRendererPdf, {
      attachTo: document.body,
      props: { file, isPreview, url: mountedUrl },
    });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // A preview is a thumbnail inside a message row — clicking it opens the message, not a viewer, so the dialog
  // Must not exist to be opened at all
  test("a preview opens nothing", async () => {
    expect.hasAssertions();

    await mountPdf(true);

    expect(document.body.querySelector("dialog")).toBeNull();
  });

  // The viewer is the whole body, so the dialog is action-less — it has nothing to confirm and nothing to cancel, and
  // Its title bar still gives it a title and a way out that is not clicking the backdrop
  test("opening the viewer", async () => {
    expect.hasAssertions();

    const component = await mountPdf(false);
    await component.find("canvas").trigger("click");

    expect(document.body.querySelector("dialog h2")?.textContent).toBe(filename);
    expect(document.body.querySelector("dialog footer")).toBeNull();
    expect(document.body.querySelector('dialog [aria-label="Close"]')).not.toBeNull();
  });

  test("opening the viewer from the keyboard", async () => {
    expect.hasAssertions();

    const component = await mountPdf(false);
    await component.get('[role="button"]').trigger("keydown", { key: "Enter" });

    expect(document.body.querySelector("dialog h2")?.textContent).toBe(filename);
  });

  // The read link is re-minted before it expires, and an open viewer would lose its page, its zoom and the password
  // If the document were loaded again from the new link
  test("a re-minted link keeps the loaded document", async () => {
    expect.hasAssertions();

    // The first page never arrives, so the thumbnail draws nothing from the document it is handed
    const pdfDocument = { getPage: () => new Promise(() => {}) } as unknown as PDFDocumentProxy;
    const task = {
      destroy: vi.fn<PDFDocumentLoadingTask["destroy"]>(() => Promise.resolve()),
      promise: Promise.resolve(pdfDocument),
    } as unknown as PDFDocumentLoadingTask;
    const getDocument = vi.fn<PdfApi["getDocument"]>(() => task);
    const renderer: PdfRenderer = {
      api: { getDocument, GlobalWorkerOptions: { workerSrc: "" } } as unknown as PdfApi,
      cMapUrl: "",
      standardFontDataUrl: "",
      wasmUrl: "",
      workerSrc: "",
    };
    vi.mocked(loadPdfRenderer).mockResolvedValueOnce(renderer);
    const component = await mountPdf(false, url);
    await flushPromises();
    await component.setProps({ url: `${url}?sig=` });
    await flushPromises();

    expect(getDocument).toHaveBeenCalledTimes(1);
  });
});
