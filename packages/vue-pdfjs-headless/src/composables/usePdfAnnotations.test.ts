// @vitest-environment happy-dom
import type { PdfAnnotationChange } from "#src/models/PdfAnnotationChange";
import type { PdfViewerState } from "#src/models/PdfViewerState";
import type { PDFDocumentProxy } from "pdfjs-dist";

import { usePdfAnnotations } from "#src/composables/usePdfAnnotations";
import { PdfEditorMode } from "#src/models/PdfEditorMode";
import { writeXfdf } from "#src/xfdf/writeXfdf";
import { flushPromises } from "@vue/test-utils";
import { err, ok } from "neverthrow";
import { afterEach, assert, describe, expect, test, vi } from "vitest";
import { effectScope, ref } from "vue";

interface TestAnnotation {
  contents?: string;
  subtype: string;
}

// The renderer's annotation storage, which an editor is stored in as it is drawn and an imported free text is written into
const createAnnotationStorage = () => {
  const entries = new Map<string, unknown>();

  return {
    setValue: (key: string, value: unknown) => {
      entries.set(key, value);
    },
    get size() {
      return entries.size;
    },
    [Symbol.iterator]: () => entries.entries(),
  };
};
// A document whose pages hold the given annotations, and whose storage the composable can take the editor hook of
const createDocument = (pagesAnnotations: TestAnnotation[][]) =>
  ({
    annotationStorage: createAnnotationStorage(),
    getPage: (pageNumber: number) =>
      Promise.resolve({ getAnnotations: () => Promise.resolve(pagesAnnotations[pageNumber - 1]) }),
    numPages: pagesAnnotations.length,
  }) as unknown as PDFDocumentProxy;
// The renderer calls its storage's editor hook with the mode of an editor it stored, or with null when it removes one
const reportEditor = (pdfDocument: PDFDocumentProxy, kind: null | PdfEditorMode) => {
  const { onAnnotationEditor } = pdfDocument.annotationStorage as unknown as {
    onAnnotationEditor?: (kind: null | PdfEditorMode) => void;
  };
  onAnnotationEditor?.(kind);
};

describe("usePdfAnnotations", () => {
  const scopes: ReturnType<typeof effectScope>[] = [];
  const mountAnnotations = (pdfDocument: PDFDocumentProxy, onChange?: (change: PdfAnnotationChange) => void) => {
    const viewer = { editorMode: ref(PdfEditorMode.None) } as unknown as PdfViewerState;
    const scope = effectScope();
    scopes.push(scope);
    const state = scope.run(() => usePdfAnnotations({ onChange, pdfDocument, viewer }));
    assert(state);

    return { state, viewer };
  };

  afterEach(() => {
    for (const scope of scopes) scope.stop();
  });

  test("#44 Listing a document's comments", async () => {
    expect.hasAssertions();

    const pdfDocument = createDocument([
      [{ contents: "First", subtype: "Text" }, { subtype: "Link" }],
      [{ contents: "Second", subtype: "Text" }],
    ]);
    const { state } = mountAnnotations(pdfDocument);
    await flushPromises();

    expect(state.comments.value).toStrictEqual([
      { contents: "First", pageNumber: 1 },
      { contents: "Second", pageNumber: 2 },
    ]);
  });

  test("a document with no comments", async () => {
    expect.hasAssertions();

    const { state } = mountAnnotations(createDocument([[{ subtype: "Link" }]]));
    await flushPromises();

    expect(state.comments.value).toStrictEqual([]);
  });

  test("#61 Drawing reports a change", () => {
    expect.hasAssertions();

    const onChange = vi.fn<(change: PdfAnnotationChange) => void>();
    const pdfDocument = createDocument([[], []]);
    mountAnnotations(pdfDocument, onChange);
    // The renderer stores an editor as it is drawn, on the page it is drawn on
    pdfDocument.annotationStorage.setValue("editor1", { pageIndex: 1 });
    reportEditor(pdfDocument, PdfEditorMode.Ink);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ kind: PdfEditorMode.Ink, pageNumber: 2 });
  });

  test("a removed editor is not reported as a drawing", () => {
    expect.hasAssertions();

    const onChange = vi.fn<(change: PdfAnnotationChange) => void>();
    const pdfDocument = createDocument([[]]);
    mountAnnotations(pdfDocument, onChange);
    reportEditor(pdfDocument, null);

    expect(onChange).not.toHaveBeenCalled();
  });

  test("setting the editor mode", () => {
    expect.hasAssertions();

    const { state, viewer } = mountAnnotations(createDocument([[]]));
    state.setEditorMode(PdfEditorMode.Ink);

    expect(viewer.editorMode.value).toBe(PdfEditorMode.Ink);
  });

  test("#69 An XFDF round trip into a fresh copy of the document", () => {
    expect.hasAssertions();

    const xfdf = writeXfdf([{ contents: "A note", id: "note", pageNumber: 2, rect: [72, 300, 200, 320] }]);
    const { state } = mountAnnotations(createDocument([[], []]));

    expect(state.importXfdf(xfdf)).toStrictEqual(ok(undefined));
    expect(state.exportXfdf()).toBe(xfdf);
  });

  test("importing XFDF that is not well formed", () => {
    expect.hasAssertions();

    const pdfDocument = createDocument([[]]);
    pdfDocument.annotationStorage.setValue("existing", { annotationType: PdfEditorMode.FreeText, id: "existing" });
    const { state } = mountAnnotations(pdfDocument);

    expect(state.importXfdf("<xfdf><annots>")).toStrictEqual(err("The XFDF is not well-formed XML"));
    expect(pdfDocument.annotationStorage.size).toBe(1);
  });

  test("a drawn free text is exported", () => {
    expect.hasAssertions();

    const pdfDocument = createDocument([[], []]);
    // A drawn editor serialises without an element id, as it has none until a page it sits on has saved it
    pdfDocument.annotationStorage.setValue("pdfjs_internal_editor_0", {
      serialize: () => ({
        annotationElementId: null,
        annotationType: PdfEditorMode.FreeText,
        id: null,
        pageIndex: 1,
        rect: [72, 300, 200, 320],
        value: "Drawn",
      }),
    });
    const { state } = mountAnnotations(pdfDocument);

    expect(state.exportXfdf()).toBe(
      writeXfdf([{ contents: "Drawn", id: "0", pageNumber: 2, rect: [72, 300, 200, 320] }]),
    );
  });

  test("importing a free text past the last page is refused", () => {
    expect.hasAssertions();

    const pdfDocument = createDocument([[]]);
    const { state } = mountAnnotations(pdfDocument);

    expect(
      state.importXfdf(writeXfdf([{ contents: "Off the end", id: "stray", pageNumber: 2, rect: [72, 300, 200, 320] }])),
    ).toStrictEqual(err("The XFDF has a free text on page 2, and the document ends at page 1"));
    expect(pdfDocument.annotationStorage.size).toBe(0);
  });

  test("an imported free text does not replace a drawn annotation", () => {
    expect.hasAssertions();

    const pdfDocument = createDocument([[]]);
    const drawn = { drawn: true };
    pdfDocument.annotationStorage.setValue("pdfjs_internal_editor_0", drawn);
    const { state } = mountAnnotations(pdfDocument);

    expect(
      state.importXfdf(writeXfdf([{ contents: "Imported", id: "0", pageNumber: 1, rect: [72, 300, 200, 320] }])),
    ).toStrictEqual(ok(undefined));
    expect([...pdfDocument.annotationStorage][0]).toStrictEqual(["pdfjs_internal_editor_0", drawn]);
    expect(pdfDocument.annotationStorage.size).toBe(2);
  });
});
