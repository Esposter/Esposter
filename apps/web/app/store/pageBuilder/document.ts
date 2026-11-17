import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { EmailDocument } from "#src/models/pageBuilder/EmailDocument";
import type { EmailKind } from "#src/models/pageBuilder/EmailKind";
import type { WebpageKind } from "#src/models/pageBuilder/WebpageKind";

import { ResourceType } from "@esposter/db-schema";

export type OpenPageBuilderDocument = OpenEmailDocument | OpenWebpageDocument;
// An email held beside its kind, the same as a webpage, so a resource's document and its kind are always opened together
interface OpenEmailDocument {
  document: EmailDocument;
  kind: EmailKind;
  type: typeof ResourceType.Email;
}
// A webpage held beside the kind it was opened as, which the shell reads the document through
interface OpenWebpageDocument {
  document: WebpageDocument;
  kind: WebpageKind;
  type: typeof ResourceType.Webpage;
}
// The open documents of the page builder, each held under its resource, so two resources open at once keep their own.
// A document is loaded and saved through the functions its caller passes, so nothing here reads a store of its own
export const usePageBuilderDocumentStore = defineStore("pageBuilder/document", () => {
  const documentMap = ref(new Map<string, OpenPageBuilderDocument>());
  // Each getter reads one resource type, so a webpage's document is never handed to an email's code or the reverse
  const getOpenDocument = (resourceId: string) => {
    const open = documentMap.value.get(resourceId);
    return open?.type === ResourceType.Webpage ? open : undefined;
  };
  const getOpenEmailDocument = (resourceId: string) => {
    const open = documentMap.value.get(resourceId);
    return open?.type === ResourceType.Email ? open : undefined;
  };
  // The document held under either type, for the edit path that applies to a webpage or an email alike
  const getHeldDocument = (resourceId: string) => documentMap.value.get(resourceId);
  const getDocument = (resourceId: string) => getOpenDocument(resourceId)?.document;
  const getEmailDocument = (resourceId: string) => getOpenEmailDocument(resourceId)?.document;
  // The one place a document is held: the kind it is opened as is held with it, and a document replaced keeps the kind
  // It was opened as only when the caller passes that kind again
  // A kind is a constant holding a schema, which a reactive proxy would break, so it is held raw
  const setDocument = (resourceId: string, kind: WebpageKind, document: WebpageDocument) => {
    documentMap.value.set(resourceId, { document, kind: markRaw(kind), type: ResourceType.Webpage });
  };
  const setEmailDocument = (resourceId: string, kind: EmailKind, document: EmailDocument) => {
    documentMap.value.set(resourceId, { document, kind: markRaw(kind), type: ResourceType.Email });
  };
  // The merge fields an email offers, which are the columns of the dataset it is bound to. Its blade holds them under its
  // Resource while mounted and clears them on unmount, so an email with no dataset bound offers none
  const mergeFieldColumnsMap = ref(new Map<string, string[]>());
  const getMergeFieldColumnsRef = (resourceId: MaybeRefOrGetter<string>) =>
    computed({
      get: () => mergeFieldColumnsMap.value.get(toValue(resourceId)) ?? [],
      set: (columnNames) => {
        mergeFieldColumnsMap.value.set(toValue(resourceId), columnNames);
      },
    });
  const setMergeFieldColumns = (resourceId: string, columnNames: string[]) => {
    mergeFieldColumnsMap.value.set(resourceId, columnNames);
  };
  return {
    getDocument,
    getEmailDocument,
    getHeldDocument,
    getMergeFieldColumnsRef,
    getOpenDocument,
    setDocument,
    setEmailDocument,
    setMergeFieldColumns,
  };
});
