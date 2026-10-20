import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { getResult } from "@esposter/shared";

// The open documents of the page builder, each held under its resource, so two webpages open at once keep their own.
// A document is loaded and saved through the functions its caller passes, and nothing here reads or writes the
// GrapesJS editors' documents, which keep their own store
export const usePageBuilderDocumentStore = defineStore("pageBuilder/document", () => {
  const documentMap = ref(new Map<string, WebpageDocument>());
  const getDocument = (resourceId: string) => documentMap.value.get(resourceId);
  const setDocument = (resourceId: string, document: WebpageDocument) => {
    documentMap.value.set(resourceId, document);
  };
  // The one place a document enters the store: the value read is parsed by the webpage schema first.
  // A value the schema refuses is thrown rather than held, so the canvas never draws a document it cannot walk
  const loadDocument = async (resourceId: string, readDocument: () => Promise<unknown>) => {
    const value = await readDocument();
    getResult(() => webpageDocumentSchema.parse(value)).match(
      (document) => {
        setDocument(resourceId, document);
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
  return { documentMap, getDocument, loadDocument, saveDocument, setDocument };
});
