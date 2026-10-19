import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

// The open documents of the page builder, each held under its resource, so two webpages open at once keep their own.
// A document is loaded and saved through the functions its caller passes, and nothing here reads or writes the
// GrapesJS editors' documents, which keep their own store
export const usePageBuilderDocumentStore = defineStore("pageBuilder/document", () => {
  const documentMap = ref(new Map<string, WebpageDocument>());
  const getDocument = (resourceId: string) => documentMap.value.get(resourceId);
  const setDocument = (resourceId: string, document: WebpageDocument) => {
    documentMap.value.set(resourceId, document);
  };
  const loadDocument = async (resourceId: string, readDocument: () => Promise<WebpageDocument>) => {
    setDocument(resourceId, await readDocument());
  };
  // Nothing is written for a resource whose document is not held, since there is no document to write
  const saveDocument = async (resourceId: string, writeDocument: (document: WebpageDocument) => Promise<void>) => {
    const document = getDocument(resourceId);
    if (document) await writeDocument(document);
  };
  return { documentMap, getDocument, loadDocument, saveDocument, setDocument };
});
