// @vitest-environment happy-dom
import type { PdfAnnotationChange } from "#src/models/PdfAnnotationChange";
import type { PdfViewerState } from "#src/models/PdfViewerState";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { MaybeRefOrGetter } from "vue";

import { createAnnotationStorage } from "#src/composables/createAnnotationStorage.fixture";
import { usePdfAnnotations } from "#src/composables/usePdfAnnotations";
import { PdfEditorMode } from "#src/models/PdfEditorMode";
import { PDF_FREE_TEXT_COLOR, PDF_FREE_TEXT_FONT_SIZE } from "#src/services/constants";
import { writeXfdf } from "#src/xfdf/writeXfdf";
import { noop } from "@esposter/shared";
import { flushPromises } from "@vue/test-utils";
import { err, ok } from "neverthrow";
import { afterEach, assert, describe, expect, test, vi } from "vitest";
import { effectScope, ref, shallowRef } from "vue";

interface MountOptions {
  isCommentsWanted?: MaybeRefOrGetter<boolean>;
  onChange?: (change: PdfAnnotationChange) => void;
}

// An annotation as pdf.js gives it: a text annotation's comment is its contentsObj's str, and no contents field exists
interface TestAnnotation {
  contentsObj?: { str: string };
  subtype: string;
}
const createTextAnnotation = (str: string): TestAnnotation => ({ contentsObj: { str }, subtype: "Text" });

// A document whose pages hold the given annotations, each released through the given spy
// Its storage takes the editor hook the composable sets
const createDocument = (pagesAnnotations: TestAnnotation[][], cleanup = vi.fn<() => boolean>(() => true)) =>
  ({
    annotationStorage: createAnnotationStorage(),
    getPage: (pageNumber: number) =>
      Promise.resolve({ cleanup, getAnnotations: () => Promise.resolve(pagesAnnotations[pageNumber - 1]) }),
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
  const mountAnnotations = (
    pdfDocument: MaybeRefOrGetter<PDFDocumentProxy | undefined>,
    { isCommentsWanted = false, onChange }: MountOptions = {},
  ) => {
    const viewer = {
      drawStoredEditors: vi.fn<() => void>(),
      editorMode: ref(PdfEditorMode.None),
    } as unknown as PdfViewerState;
    const scope = effectScope();
    scopes.push(scope);
    const state = scope.run(() => usePdfAnnotations({ isCommentsWanted, onChange, pdfDocument, viewer }));
    assert(state);

    return { state, viewer };
  };

  afterEach(() => {
    for (const scope of scopes) scope.stop();
  });

  test("#44 Listing a document's comments", async () => {
    expect.hasAssertions();

    const pdfDocument = createDocument([
      [createTextAnnotation("First"), { subtype: "Link" }],
      [createTextAnnotation("Second")],
    ]);
    const { state } = mountAnnotations(pdfDocument, { isCommentsWanted: true });
    await flushPromises();

    expect(state.comments.value).toStrictEqual([
      { contents: "First", pageNumber: 1 },
      { contents: "Second", pageNumber: 2 },
    ]);
  });

  test("a document with no comments", async () => {
    expect.hasAssertions();

    const { state } = mountAnnotations(createDocument([[{ subtype: "Link" }]]), { isCommentsWanted: true });
    await flushPromises();

    expect(state.comments.value).toStrictEqual([]);
  });

  test("comments are not read until they are wanted", async () => {
    expect.hasAssertions();

    const isCommentsWanted = ref(false);
    const { state } = mountAnnotations(createDocument([[createTextAnnotation("First")]]), { isCommentsWanted });
    await flushPromises();

    expect(state.comments.value).toBeUndefined();
    isCommentsWanted.value = true;
    await flushPromises();

    expect(state.comments.value).toStrictEqual([{ contents: "First", pageNumber: 1 }]);
  });

  test("comments are unread until their read settles", async () => {
    expect.hasAssertions();

    const lateComments = Promise.withResolvers<TestAnnotation[]>();
    const pdfDocument = {
      annotationStorage: createAnnotationStorage(),
      getPage: () => Promise.resolve({ cleanup: () => true, getAnnotations: () => lateComments.promise }),
      numPages: 1,
    } as unknown as PDFDocumentProxy;
    const { state } = mountAnnotations(pdfDocument, { isCommentsWanted: true });
    await flushPromises();

    expect(state.comments.value).toBeUndefined();
    lateComments.resolve([createTextAnnotation("First")]);
    await flushPromises();

    expect(state.comments.value).toStrictEqual([{ contents: "First", pageNumber: 1 }]);
  });

  test("comments that cannot be read are an empty list", async () => {
    expect.hasAssertions();

    const error = new Error(" ");
    const consoleError = vi.spyOn(console, "error").mockImplementation(noop);
    const pdfDocument = {
      annotationStorage: createAnnotationStorage(),
      getPage: () => Promise.reject(error),
      numPages: 1,
    } as unknown as PDFDocumentProxy;
    const { state } = mountAnnotations(pdfDocument, { isCommentsWanted: true });
    await flushPromises();

    expect(consoleError).toHaveBeenCalledExactlyOnceWith(error);
    expect(state.comments.value).toStrictEqual([]);
  });

  test("a document's comments are read once, however often they are wanted again", async () => {
    expect.hasAssertions();

    const cleanup = vi.fn<() => boolean>(() => true);
    const isCommentsWanted = ref(false);
    mountAnnotations(createDocument([[createTextAnnotation("First")]], cleanup), { isCommentsWanted });
    isCommentsWanted.value = true;
    await flushPromises();
    isCommentsWanted.value = false;
    await flushPromises();
    isCommentsWanted.value = true;
    await flushPromises();

    expect(cleanup).toHaveBeenCalledExactlyOnceWith();
  });

  test("each page's proxy is released once its comments are read", async () => {
    expect.hasAssertions();

    const cleanup = vi.fn<() => boolean>(() => true);
    mountAnnotations(createDocument([[], []], cleanup), { isCommentsWanted: true });
    await flushPromises();

    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  test("a document replaced while its comments are read is not shown with the replaced one's comments", async () => {
    expect.hasAssertions();

    const lateComments = Promise.withResolvers<TestAnnotation[]>();
    const replacedDocument = {
      annotationStorage: createAnnotationStorage(),
      getPage: () => Promise.resolve({ cleanup: () => true, getAnnotations: () => lateComments.promise }),
      numPages: 1,
    } as unknown as PDFDocumentProxy;
    const pdfDocument = shallowRef<PDFDocumentProxy | undefined>(replacedDocument);
    const { state } = mountAnnotations(pdfDocument, { isCommentsWanted: true });
    pdfDocument.value = createDocument([[createTextAnnotation("New")]]);
    await flushPromises();
    lateComments.resolve([createTextAnnotation("Replaced")]);
    await flushPromises();

    expect(state.comments.value).toStrictEqual([{ contents: "New", pageNumber: 1 }]);
  });

  test("#61 Drawing reports a change", () => {
    expect.hasAssertions();

    const onChange = vi.fn<(change: PdfAnnotationChange) => void>();
    const pdfDocument = createDocument([[], []]);
    mountAnnotations(pdfDocument, { onChange });
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
    mountAnnotations(pdfDocument, { onChange });
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
    const { state, viewer } = mountAnnotations(pdfDocument);

    expect(
      state.importXfdf(writeXfdf([{ contents: "Off the end", id: "stray", pageNumber: 2, rect: [72, 300, 200, 320] }])),
    ).toStrictEqual(err("The XFDF has a free text on page 2, and the document ends at page 1"));
    expect(pdfDocument.annotationStorage.size).toBe(0);
    expect(viewer.drawStoredEditors).not.toHaveBeenCalled();
  });

  test("importing a free text with no contents is refused", () => {
    expect.hasAssertions();

    const pdfDocument = createDocument([[]]);
    const { state, viewer } = mountAnnotations(pdfDocument);

    expect(
      state.importXfdf(writeXfdf([{ contents: "", id: "blank", pageNumber: 1, rect: [72, 300, 200, 320] }])),
    ).toStrictEqual(err("Free text 1 has no contents"));
    expect(pdfDocument.annotationStorage.size).toBe(0);
    expect(viewer.drawStoredEditors).not.toHaveBeenCalled();
  });

  test("importing a free text draws it on its page", () => {
    expect.hasAssertions();

    const pdfDocument = createDocument([[], []]);
    const { state, viewer } = mountAnnotations(pdfDocument);

    expect(
      state.importXfdf(writeXfdf([{ contents: "A note", id: "note", pageNumber: 2, rect: [72, 300, 200, 320] }])),
    ).toStrictEqual(ok(undefined));
    // Stored as a clone, the renderer restores it onto its page as an editor, so the save holds it once, as that editor
    expect([...pdfDocument.annotationStorage]).toStrictEqual([
      [
        "pdfjs_internal_editor_xfdfnote",
        {
          annotationType: PdfEditorMode.FreeText,
          color: PDF_FREE_TEXT_COLOR,
          deleted: false,
          fontSize: PDF_FREE_TEXT_FONT_SIZE,
          id: "note",
          isClone: true,
          isCopy: true,
          pageIndex: 1,
          rect: [72, 300, 200, 320],
          rotation: 0,
          value: "A note",
        },
      ],
    ]);
    expect(viewer.drawStoredEditors).toHaveBeenCalledExactlyOnceWith();
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

  test("importing two free texts with no name stores both", () => {
    expect.hasAssertions();

    const pdfDocument = createDocument([[]]);
    const { state } = mountAnnotations(pdfDocument);

    expect(
      state.importXfdf(
        `<xfdf xmlns="http://ns.adobe.com/xfdf/"><annots><freetext name="" page="0" rect="72,300,200,320"><contents>a</contents></freetext><freetext name="" page="0" rect="72,300,200,320"><contents>a</contents></freetext></annots></xfdf>`,
      ),
    ).toStrictEqual(ok(undefined));
    expect(pdfDocument.annotationStorage.size).toBe(2);
  });

  test("importing two free texts that share a name stores both", () => {
    expect.hasAssertions();

    const pdfDocument = createDocument([[]]);
    const { state } = mountAnnotations(pdfDocument);

    expect(
      state.importXfdf(
        `<xfdf xmlns="http://ns.adobe.com/xfdf/"><annots><freetext name="a" page="0" rect="72,300,200,320"><contents>a</contents></freetext><freetext name="a" page="0" rect="72,300,200,320"><contents>a</contents></freetext></annots></xfdf>`,
      ),
    ).toStrictEqual(ok(undefined));
    expect(pdfDocument.annotationStorage.size).toBe(2);
  });

  test("importing a free text named as one already imported stores both", () => {
    expect.hasAssertions();

    const pdfDocument = createDocument([[]]);
    const { state } = mountAnnotations(pdfDocument);
    const xfdf = `<xfdf xmlns="http://ns.adobe.com/xfdf/"><annots><freetext name="a" page="0" rect="72,300,200,320"><contents>a</contents></freetext></annots></xfdf>`;

    expect(state.importXfdf(xfdf)).toStrictEqual(ok(undefined));
    expect(state.importXfdf(xfdf)).toStrictEqual(ok(undefined));
    expect(pdfDocument.annotationStorage.size).toBe(2);
  });
});
