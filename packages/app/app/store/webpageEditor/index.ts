import type { ProjectData } from "grapesjs";

import { WebpageEditor, webpageEditorSchema } from "#shared/models/webpageEditor/data/WebpageEditor";
import { WEBPAGE_EDITOR_LOCAL_STORAGE_KEY } from "@/services/webpageEditor/constants";

export const useWebpageEditorStore = defineStore("webpageEditor", () => {
  const { $trpc } = useNuxtApp();
  const { content, load, save } = useDocumentState(
    WebpageEditor,
    {
      createDocument: (input) => $trpc.webpageEditor.createDocument.mutate(input),
      deleteDocument: (input) => $trpc.webpageEditor.deleteDocument.mutate(input),
      publishDocument: (input) => $trpc.webpageEditor.publishDocument.mutate(input),
      readDocumentContent: (input) => $trpc.webpageEditor.readDocumentContent.query(input),
      readDocuments: async () => (await $trpc.webpageEditor.readDocuments.query({})).items,
      saveDocumentContent: (input) => $trpc.webpageEditor.saveDocumentContent.mutate(input),
      unpublishDocument: (input) => $trpc.webpageEditor.unpublishDocument.mutate(input),
      updateDocument: (input) => $trpc.webpageEditor.updateDocument.mutate(input),
    },
    { defaultName: "My Webpage", localStorageKey: WEBPAGE_EDITOR_LOCAL_STORAGE_KEY, schema: webpageEditorSchema },
  );
  const readWebpageEditor = async () => {
    await load();
    return content.value;
  };
  const saveWebpageEditor = async (projectData: ProjectData) => {
    content.value = new WebpageEditor(projectData);
    await save();
  };
  return { readWebpageEditor, saveWebpageEditor };
});
