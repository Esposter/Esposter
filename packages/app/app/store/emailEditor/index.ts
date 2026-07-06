import type { ProjectData } from "grapesjs";

import { EmailEditor, emailEditorSchema } from "#shared/models/emailEditor/data/EmailEditor";
import { EMAIL_EDITOR_LOCAL_STORAGE_KEY } from "@/services/emailEditor/constants";

export const useEmailEditorStore = defineStore("emailEditor", () => {
  const { $trpc } = useNuxtApp();
  const { content, load, save } = useDocumentState(
    EmailEditor,
    {
      createDocument: (input) => $trpc.emailEditor.createDocument.mutate(input),
      deleteDocument: (input) => $trpc.emailEditor.deleteDocument.mutate(input),
      publishDocument: (input) => $trpc.emailEditor.publishDocument.mutate(input),
      readDocumentContent: (input) => $trpc.emailEditor.readDocumentContent.query(input),
      readDocuments: async () => (await $trpc.emailEditor.readDocuments.query({})).items,
      saveDocumentContent: (input) => $trpc.emailEditor.saveDocumentContent.mutate(input),
      unpublishDocument: (input) => $trpc.emailEditor.unpublishDocument.mutate(input),
      updateDocument: (input) => $trpc.emailEditor.updateDocument.mutate(input),
    },
    { defaultName: "My Email", localStorageKey: EMAIL_EDITOR_LOCAL_STORAGE_KEY, schema: emailEditorSchema },
  );
  const readEmailEditor = async () => {
    await load();
    return content.value;
  };
  const saveEmailEditor = async (projectData: ProjectData) => {
    content.value = new EmailEditor(projectData);
    await save();
  };
  return { readEmailEditor, saveEmailEditor };
});
