import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { createContentData } from "@/services/resource/createContentData";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";

export const useWebpageEditorStore = defineStore("webpageEditor", () => {
  const resourceStore = useResourceStore();
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const {
    content: webpageEditor,
    loadContent,
    saveContent,
  } = createContentData(
    ResourceType.Webpage,
    (data) => new WebpageEditor(data),
    // The page builder edits the tree and root the content holds, so every read hands them over, and a reload drops the
    // History of the document it replaces
    (webpage) => {
      const resourceId = resourceStore.currentResourceId;
      if (!resourceId) return;

      pageBuilderDocumentStore.setDocument(resourceId, webpageKind, { content: webpage.content, root: webpage.root });
      pageBuilderHistoryStore.clearHistory(resourceId);
    },
  );
  // The document the page builder holds is written back as the content's tree and root, with the identity and share
  // Preview the content keeps beside them. Nothing is written for a resource whose document is not held
  const saveWebpage = (resourceId: string) =>
    pageBuilderDocumentStore.saveDocument(resourceId, async (document) => {
      webpageEditor.value.content = document.content;
      webpageEditor.value.root = document.root;
      await saveContent();
    });
  return { loadContent, saveWebpage, webpageEditor };
});
