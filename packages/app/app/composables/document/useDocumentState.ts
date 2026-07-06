// oxlint-disable typescript/no-unnecessary-type-assertion
import type { DocumentProcedures } from "@/models/document/DocumentProcedures";
import type { Document } from "@esposter/db-schema";
import type { ItemMetadata } from "@esposter/shared";
import type { z } from "zod";

import { authClient } from "@/services/auth/authClient";
import { DOCUMENT_ID_QUERY_PARAMETER_KEY } from "@/services/shared/constants";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";
import { useAlertStore } from "@/store/alert";
import { getResultAsync, jsonDateParse, noop, takeOne } from "@esposter/shared";

interface UseDocumentStateOptions {
  defaultName: string;
  localStorageKey: string;
  schema: z.ZodType;
}
// The init parameter is typed never so every content class with an optional-init constructor is accepted
// (their init types vary: Partial<X> vs PartialDeep<X>); the single `as never` below is the centralized cost.
export const useDocumentState = <TContent extends ItemMetadata>(
  Model: new (init?: never) => TContent,
  procedures: DocumentProcedures<TContent>,
  { defaultName, localStorageKey, schema }: UseDocumentStateOptions,
) => {
  const session = authClient.useSession();
  const route = useRoute();
  const alertStore = useAlertStore();
  const saveToLocalStorage = useSaveToLocalStorage();
  const documents = ref<Document[]>([]);
  const currentDocument = ref<Document>();
  const content = ref(new Model()) as Ref<TContent>;

  const selectDocument = async (id: Document["id"]) => {
    const document = documents.value.find((foundDocument) => foundDocument.id === id);
    if (!document) return;

    currentDocument.value = document;
    const data = await procedures.readDocumentContent({ id });
    content.value = new Model((data ?? undefined) as never);
  };
  // The unauthenticated path stays single-document in local storage
  const loadLocal = () => {
    const contentJson = localStorage.getItem(localStorageKey);
    content.value = contentJson ? new Model(jsonDateParse(contentJson) as never) : new Model();
  };
  const load = async () => {
    documents.value = await procedures.readDocuments();
    if (documents.value.length === 0) documents.value = [await procedures.createDocument({ name: defaultName })];
    // The documents hub deep-links a specific document via query param; fall back to the most recent otherwise
    const requestedId = route.query[DOCUMENT_ID_QUERY_PARAMETER_KEY];
    const requestedDocument =
      typeof requestedId === "string"
        ? documents.value.find((foundDocument) => foundDocument.id === requestedId)
        : undefined;
    await selectDocument((requestedDocument ?? takeOne(documents.value)).id);
  };
  const save = (): Promise<boolean> => {
    saveItemMetadata(content.value);

    const document = currentDocument.value;
    if (session.value.data && document)
      return getResultAsync(async () => {
        const updatedDocument = await procedures.saveDocumentContent({
          content: content.value,
          contentVersion: document.contentVersion,
          id: document.id,
        });
        currentDocument.value = updatedDocument;
        documents.value = documents.value.map((foundDocument) =>
          foundDocument.id === updatedDocument.id ? updatedDocument : foundDocument,
        );
      }).match(
        () => true,
        (error) => {
          alertStore.createAlert(error.message, "error");
          return false;
        },
      );

    return Promise.resolve(saveToLocalStorage(localStorageKey, schema, content.value));
  };
  const createDocument = async (name: Document["name"]) => {
    const newDocument = await procedures.createDocument({ name });
    documents.value = [newDocument, ...documents.value];
    await selectDocument(newDocument.id);
  };
  const renameDocument = async (id: Document["id"], name: Document["name"]) => {
    const updatedDocument = await procedures.updateDocument({ id, name });
    documents.value = documents.value.map((foundDocument) =>
      foundDocument.id === updatedDocument.id ? updatedDocument : foundDocument,
    );
    if (currentDocument.value?.id === updatedDocument.id) currentDocument.value = updatedDocument;
  };
  const deleteDocument = async (id: Document["id"]) => {
    await procedures.deleteDocument({ id });
    documents.value = documents.value.filter((foundDocument) => foundDocument.id !== id);
    if (currentDocument.value?.id === id) await load();
  };
  const setCurrentDocument = (document: Document) => {
    currentDocument.value = document;
    documents.value = documents.value.map((foundDocument) =>
      foundDocument.id === document.id ? document : foundDocument,
    );
  };
  // Publishing bakes the latest content, so a failed save must abort instead of publishing stale content
  const publish = async () => {
    if (!(await save())) return;
    const document = currentDocument.value;
    if (!document) return;
    await getResultAsync(async () => {
      setCurrentDocument(await procedures.publishDocument({ id: document.id }));
    }).match(noop, (error) => {
      alertStore.createAlert(error.message, "error");
    });
  };
  const unpublish = async () => {
    const document = currentDocument.value;
    if (!document) return;
    await getResultAsync(async () => {
      setCurrentDocument(await procedures.unpublishDocument({ id: document.id }));
    }).match(noop, (error) => {
      alertStore.createAlert(error.message, "error");
    });
  };
  return {
    content,
    createDocument,
    currentDocument,
    deleteDocument,
    documents,
    load,
    loadLocal,
    publish,
    renameDocument,
    save,
    selectDocument,
    setCurrentDocument,
    unpublish,
  };
};
