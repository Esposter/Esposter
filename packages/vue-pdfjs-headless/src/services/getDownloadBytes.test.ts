// @vitest-environment node
import type { PdfFreeTextEntry } from "#src/models/PdfFreeTextEntry";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

import { PDF_EDITOR_KEY_PREFIX, PDF_WATERMARK_FONT_SIZE } from "#src/services/constants";
import { createFormPdf } from "#src/services/createFormPdf.fixture";
import { getDownloadBytes } from "#src/services/getDownloadBytes";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

// Reads the value of the document's first form field back from the bytes a download carries
const readFieldValue = async (bytes: Uint8Array) => {
  const saved = await getDocument({ data: new Uint8Array(bytes), verbosity: 0 }).promise;
  const annotations = await (await saved.getPage(1)).getAnnotations();

  return annotations.find((annotation) => annotation.subtype === "Widget")?.fieldValue;
};

describe(getDownloadBytes, () => {
  const PAGE_WIDTH = 200;
  const PAGE_HEIGHT = 100;
  // A page with a quarter turn of its own: pdf.js's viewport is the turned page, while its view box is the unturned one
  const createTurnedDocument = () => {
    const page = {
      cleanup: vi.fn<PDFPageProxy["cleanup"]>(() => true),
      getViewport: () => ({ height: PAGE_WIDTH, width: PAGE_HEIGHT }),
      rotate: 90,
      view: [0, 0, PAGE_WIDTH, PAGE_HEIGHT],
    } as unknown as PDFPageProxy;
    const annotationStorage = {
      remove: vi.fn<(key: string) => void>(),
      setValue: vi.fn<(key: string, value: unknown) => void>(),
      size: 0,
    };
    const pdfDocument = {
      annotationStorage,
      getPage: vi.fn<PDFDocumentProxy["getPage"]>(() => Promise.resolve(page)),
      numPages: 1,
      saveDocument: vi.fn<PDFDocumentProxy["saveDocument"]>(() => Promise.resolve(new Uint8Array([1]))),
    } as unknown as PDFDocumentProxy;

    return { annotationStorage, pdfDocument };
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The renderer keys a text field's value by the field's id, which the input writes under that id
  test.each([false, true])(
    "#268 Filling a form and downloading it, with NeedAppearances %s",
    async (needAppearances) => {
      expect.hasAssertions();

      const pdfDocument = await getDocument({ data: createFormPdf({ needAppearances }), verbosity: 0 }).promise;
      pdfDocument.annotationStorage.setValue("4R", { value: "Typed" });
      const bytes = await getDownloadBytes(pdfDocument, undefined);

      await expect(readFieldValue(bytes)).resolves.toBe("Typed");
    },
  );

  // A failure means the pinned pdf.js now saves a text annotation, so a comment can be added. The deferred idea at
  // `openspec/deferred/vue-pdfjs-headless/annotation-comments/design.md` is then revived, and this test is retired with it
  test("pdf.js still drops a Text annotation when it saves", async () => {
    expect.hasAssertions();

    const pdfDocument = await getDocument({ data: createFormPdf({ needAppearances: false }), verbosity: 0 }).promise;
    // The annotation type of a text annotation, which the editor modes do not name
    // The value is not blank, so the renderer's rule for blank text cannot explain a drop
    pdfDocument.annotationStorage.setValue(`${PDF_EDITOR_KEY_PREFIX}0`, {
      annotationType: 1,
      color: [0, 0, 0],
      deleted: false,
      id: "0",
      pageIndex: 0,
      rect: [20, 40, 44, 64],
      rotation: 0,
      value: "a",
    });
    const bytes = await getDownloadBytes(pdfDocument, undefined);
    const saved = await getDocument({ data: new Uint8Array(bytes), verbosity: 0 }).promise;
    const annotations = await (await saved.getPage(1)).getAnnotations();

    expect(annotations.map(({ subtype }) => subtype)).toStrictEqual(["Widget"]);
  });

  test("a watermark band crosses the middle of a page turned a quarter", async () => {
    expect.hasAssertions();

    const { annotationStorage, pdfDocument } = createTurnedDocument();
    await getDownloadBytes(pdfDocument, "DRAFT");
    const [, entry] = annotationStorage.setValue.mock.calls[0] ?? [];
    assert(entry);
    const { rect } = entry as PdfFreeTextEntry;

    // The rectangle is in the page's unturned user space, so its middle band spans the box's full width
    expect(rect).toStrictEqual([
      0,
      PAGE_HEIGHT / 2 - PDF_WATERMARK_FONT_SIZE / 2,
      PAGE_WIDTH,
      PAGE_HEIGHT / 2 + PDF_WATERMARK_FONT_SIZE / 2,
    ]);
  });
});
