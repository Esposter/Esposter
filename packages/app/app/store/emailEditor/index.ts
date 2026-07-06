import type { DatasetReference } from "#shared/models/dataset/DatasetReference";
import type { ProjectData } from "grapesjs";

import { EmailEditor, emailEditorSchema } from "#shared/models/emailEditor/data/EmailEditor";
import { authClient } from "@/services/auth/authClient";
import { EMAIL_EDITOR_LOCAL_STORAGE_KEY } from "@/services/emailEditor/constants";

export const useEmailEditorStore = defineStore("emailEditor", () => {
  const { $trpc } = useNuxtApp();
  const session = authClient.useSession();
  const {
    content,
    createDocument,
    currentDocument,
    deleteDocument,
    documents,
    load,
    loadLocal,
    renameDocument,
    save,
    selectDocument,
  } = useDocumentState(
    EmailEditor,
    {
      createDocument: (input) => $trpc.emailEditor.createDocument.mutate(input),
      deleteDocument: (input) => $trpc.emailEditor.deleteDocument.mutate(input),
      publishDocument: (input) => $trpc.emailEditor.publishDocument.mutate(input),
      readDocumentContent: (input) => $trpc.emailEditor.readDocumentContent.query(input),
      readDocuments: async () => (await $trpc.emailEditor.readDocuments.query()).items,
      saveDocumentContent: (input) => $trpc.emailEditor.saveDocumentContent.mutate(input),
      unpublishDocument: (input) => $trpc.emailEditor.unpublishDocument.mutate(input),
      updateDocument: (input) => $trpc.emailEditor.updateDocument.mutate(input),
    },
    { defaultName: "My Email", localStorageKey: EMAIL_EDITOR_LOCAL_STORAGE_KEY, schema: emailEditorSchema },
  );
  const datasetReference = computed(() => content.value.datasetReference);
  // The document list load happens once; subsequent editor storage loads serve the selected document's content
  const readEmailEditor = async () => {
    if (session.value.data) {
      if (!currentDocument.value) await load();
    } else loadLocal();
    return content.value;
  };
  // GrapesJS project data doesn't know about the dataset binding, so saves carry it over
  const saveEmailEditor = async (projectData: ProjectData) => {
    content.value = new EmailEditor({ ...projectData, datasetReference: datasetReference.value });
    await save();
  };
  const saveDatasetReference = async (newDatasetReference: DatasetReference | undefined) => {
    content.value.datasetReference = newDatasetReference;
    await save();
  };
  return {
    createDocument,
    currentDocument,
    datasetReference,
    deleteDocument,
    documents,
    readEmailEditor,
    renameDocument,
    saveDatasetReference,
    saveEmailEditor,
    selectDocument,
  };
});
