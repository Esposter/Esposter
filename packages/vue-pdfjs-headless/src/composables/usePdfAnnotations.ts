import type { PdfAnnotationChange } from "#src/models/PdfAnnotationChange";
import type { PdfAnnotationsState } from "#src/models/PdfAnnotationsState";
import type { PdfComment } from "#src/models/PdfComment";
import type { PdfFreeText } from "#src/models/PdfFreeText";
import type { PdfViewerState } from "#src/models/PdfViewerState";
import type { Result } from "neverthrow";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { MaybeRefOrGetter } from "vue";

import { PdfEditorMode } from "#src/models/PdfEditorMode";
import { PDF_EDITOR_KEY_PREFIX, PDF_FREE_TEXT_COLOR, PDF_FREE_TEXT_FONT_SIZE } from "#src/services/constants";
import { createFreeTextEntry } from "#src/services/createFreeTextEntry";
import { getPdfPages } from "#src/services/getPdfPages";
import { readXfdf } from "#src/xfdf/readXfdf";
import { writeXfdf } from "#src/xfdf/writeXfdf";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";
import { err, ok } from "neverthrow";
import { shallowRef, toValue, watch } from "vue";

interface UsePdfAnnotationsOptions {
  // Whether the comments are wanted. A document's comments are read the first time they are, and not before
  isCommentsWanted?: MaybeRefOrGetter<boolean>;
  // Called for each annotation the reader draws, with the mode it was drawn in and its page
  onChange?: (change: PdfAnnotationChange) => void;
  pdfDocument: MaybeRefOrGetter<PDFDocumentProxy | undefined>;
  viewer: PdfViewerState;
}

// A text annotation is a comment, and each page's text annotations are read in page order
const readComments = async (loaded: PDFDocumentProxy): Promise<PdfComment[]> => {
  const pages = await getPdfPages(loaded);
  const pageComments = await Promise.all(
    pages.map(async (page, pageIndex) => {
      const annotations = await page.getAnnotations();
      // A page's proxy is released once its annotations are read, since the document keeps the proxies it hands out
      page.cleanup();

      return annotations
        .filter(({ subtype }) => subtype === "Text")
        .map(({ contents }) => ({ contents: contents ?? "", pageNumber: pageIndex + 1 }));
    }),
  );

  return pageComments.flat();
};

// Pdf.js types its storage's editor hook as null, though it calls the hook as a function, so the hook is assigned here
const setEditorHook = (loaded: PDFDocumentProxy, onEditor: (kind: null | PdfEditorMode) => void) => {
  Object.assign(loaded.annotationStorage, { onAnnotationEditor: onEditor });
};

// A drawn editor serialises itself, and an imported entry is already the data the renderer saves
interface StoredFreeText {
  annotationType?: number;
  id?: null | string;
  pageIndex?: number;
  rect?: [number, number, number, number];
  value?: string;
}
const readFreeTexts = (loaded: PDFDocumentProxy): PdfFreeText[] =>
  Array.from(loaded.annotationStorage, ([key, value]): PdfFreeText[] => {
    const data: StoredFreeText | undefined = typeof value.serialize === "function" ? value.serialize() : value;
    if (data?.annotationType !== PdfEditorMode.FreeText || !data.rect) return [];

    // A drawn editor has no element id until a page it sits on saves it, so its id is the key the renderer stores it under
    const id = data.id ?? key.slice(PDF_EDITOR_KEY_PREFIX.length);

    return [{ contents: data.value ?? "", id, pageNumber: (data.pageIndex ?? 0) + 1, rect: data.rect }];
  }).flat();

// An imported free text is stored as the renderer's own free text, so the save writes it like one drawn. It is keyed
// Apart from the renderer's numbered editors, which an imported name could otherwise replace, by the XFDF prefix and the
// Free text's id
const storeFreeTexts = (loaded: PDFDocumentProxy, freeTexts: PdfFreeText[]) => {
  for (const { contents, id, pageNumber, rect } of freeTexts)
    loaded.annotationStorage.setValue(
      `${PDF_EDITOR_KEY_PREFIX}xfdf${id}`,
      createFreeTextEntry({
        color: PDF_FREE_TEXT_COLOR,
        fontSize: PDF_FREE_TEXT_FONT_SIZE,
        id,
        pageIndex: pageNumber - 1,
        rect,
        value: contents,
      }),
    );
};

export const usePdfAnnotations = ({
  isCommentsWanted = false,
  onChange,
  pdfDocument,
  viewer,
}: UsePdfAnnotationsOptions): PdfAnnotationsState => {
  const comments = shallowRef<PdfComment[]>();
  const loadComments = getSynchronizedFunction(async (loaded: PDFDocumentProxy) => {
    await getResultAsync(async () => {
      const loadedComments = await readComments(loaded);
      // Comments still loading when another document replaces this one are dropped, as the newer document's stand
      if (loaded === toValue(pdfDocument)) comments.value = loadedComments;
    }).match(noop, (error) => {
      console.error(error);
      // Comments that cannot be read are an empty list, so their tab says so rather than loading for ever
      if (loaded === toValue(pdfDocument)) comments.value = [];
    });
  });
  const setEditorMode = (mode: PdfEditorMode) => {
    viewer.editorMode.value = mode;
  };
  const exportXfdf = () => {
    const loaded = toValue(pdfDocument);

    return writeXfdf(loaded ? readFreeTexts(loaded) : []);
  };
  // A free text past the document's last page is refused before any is stored, as the save would fail on it
  const importXfdf = (xfdf: string): Result<void, string> => {
    const loaded = toValue(pdfDocument);
    if (!loaded) return err("No document is open to import into");

    // The ids the document already holds are taken by the reader, so an imported free text named as one keeps an id of its own
    return readXfdf(xfdf, new Set(readFreeTexts(loaded).map(({ id }) => id))).andThen((freeTexts) => {
      const stray = freeTexts.find(({ pageNumber }) => pageNumber > loaded.numPages);
      if (stray)
        return err(
          `The XFDF has a free text on page ${stray.pageNumber}, and the document ends at page ${loaded.numPages}`,
        );

      storeFreeTexts(loaded, freeTexts);

      return ok(undefined);
    });
  };

  watch(
    () => toValue(pdfDocument),
    (loaded) => {
      comments.value = undefined;
      if (!loaded) return;

      setEditorHook(loaded, (kind) => {
        // The renderer reports null when it removes an editor, which is not a drawing
        if (kind === null) return;

        // The renderer stores an editor as it is drawn, so the last entry stored is the annotation just drawn
        const drawn: undefined | { pageIndex: number } = [...loaded.annotationStorage].at(-1)?.[1];
        if (drawn) onChange?.({ kind, pageNumber: drawn.pageIndex + 1 });
      });
    },
    { immediate: true },
  );
  // The document whose comments were last asked for, so each document's comments are read once, the first time they are
  // Wanted. A document that replaces it is a different one, so its comments are read when they are wanted
  let commentsDocument: PDFDocumentProxy | undefined;
  watch(
    [() => toValue(pdfDocument), () => toValue(isCommentsWanted)],
    ([loaded, isWanted]) => {
      if (!loaded || !isWanted || loaded === commentsDocument) return;

      commentsDocument = loaded;
      loadComments(loaded);
    },
    { immediate: true },
  );

  return { comments, exportXfdf, importXfdf, setEditorMode };
};
