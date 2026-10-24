import type { WebpageKind } from "@/models/pageBuilder/WebpageKind";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { getResult } from "@esposter/shared";

// A document the page builder holds, beside the kind it was opened as, which the shell reads the document through
export interface OpenPageBuilderDocument {
  document: WebpageDocument;
  kind: WebpageKind;
}

// The open documents of the page builder, each held under its resource, so two webpages open at once keep their own.
// A document is loaded and saved through the functions its caller passes, and nothing here reads or writes the
// GrapesJS editors' documents, which keep their own store
export const usePageBuilderDocumentStore = defineStore("pageBuilder/document", () => {
  const documentMap = ref(new Map<string, OpenPageBuilderDocument>());
  const getOpenDocument = (resourceId: string) => documentMap.value.get(resourceId);
  const getDocument = (resourceId: string) => getOpenDocument(resourceId)?.document;
  const getKind = (resourceId: string) => getOpenDocument(resourceId)?.kind;
  // The one place a document is held: the kind it is opened as is held with it, and a document replaced keeps the kind
  // It was opened as only when the caller passes that kind again
  // A kind is a constant holding a schema, which a reactive proxy would break, so it is held raw
  const setDocument = (resourceId: string, kind: WebpageKind, document: WebpageDocument) => {
    documentMap.value.set(resourceId, { document, kind: markRaw(kind) });
  };
  // The one place a document enters the store from a read: the value read is parsed by its kind's schema first.
  // A value the schema refuses is thrown rather than held, so the canvas never draws a document it cannot walk
  const loadDocument = async (resourceId: string, kind: WebpageKind, readDocument: () => Promise<unknown>) => {
    const value = await readDocument();
    getResult(() => kind.documentSchema.parse(value)).match(
      (document) => {
        setDocument(resourceId, kind, document);
      },
      (error) => {
        throw error;
      },
    );
  };
  // Nothing is written for a resource whose document is not held, since there is no document to write
  const saveDocument = async (resourceId: string, writeDocument: (document: WebpageDocument) => Promise<void>) => {
    const document = getDocument(resourceId);
    if (document) await writeDocument(document);
  };
  return { documentMap, getDocument, getKind, getOpenDocument, loadDocument, saveDocument, setDocument };
});
