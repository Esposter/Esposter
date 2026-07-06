import type { ProjectData } from "grapesjs";

import { WebpageEditor, webpageEditorSchema } from "#shared/models/webpageEditor/data/WebpageEditor";
import { authClient } from "@/services/auth/authClient";
import { WEBPAGE_EDITOR_LOCAL_STORAGE_KEY } from "@/services/webpageEditor/constants";

export const useWebpageEditorStore = defineStore("webpageEditor", () => {
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
    publish: publishWebpage,
    renameDocument,
    save,
    selectDocument,
    unpublish: unpublishWebpage,
  } = useDocumentState(
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
  // The document list load happens once; subsequent editor storage loads serve the selected document's content
  const readWebpageEditor = async () => {
    if (session.value.data) {
      if (!currentDocument.value) await load();
    } else loadLocal();
    return content.value;
  };
  const saveWebpageEditor = async (projectData: ProjectData, { css, html }: Pick<WebpageEditor, "css" | "html">) => {
    content.value = new WebpageEditor({ ...projectData, css, html });
    await save();
  };
  return {
    createDocument,
    currentDocument,
    deleteDocument,
    documents,
    publishWebpage,
    readWebpageEditor,
    renameDocument,
    saveWebpageEditor,
    selectDocument,
    unpublishWebpage,
  };
});
