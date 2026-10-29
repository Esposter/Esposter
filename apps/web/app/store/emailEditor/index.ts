import type { DatasetReference } from "#shared/models/dataset/DatasetReference";

import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { createContentData } from "@/services/resource/createContentData";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";

export const useEmailEditorStore = defineStore("emailEditor", () => {
  const resourceStore = useResourceStore();
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const {
    content: emailEditor,
    loadContent,
    saveContent,
  } = createContentData(
    ResourceType.Email,
    (data) => new EmailEditor(data),
    // The page builder edits the body and head the content holds, so every read hands them over, and a reload drops the
    // History of the document it replaces
    (email) => {
      const resourceId = resourceStore.currentResourceId;
      if (!resourceId) return;

      pageBuilderDocumentStore.setEmailDocument(resourceId, emailKind, { content: email.content, root: email.root });
      pageBuilderHistoryStore.clearHistory(resourceId);
    },
  );
  const datasetReference = computed(() => emailEditor.value.datasetReference);
  // The document the page builder holds is written back as the content's body and head, with the dataset binding the
  // Content keeps beside them. Nothing is written for a resource whose document is not held
  const saveEmail = (resourceId: string) =>
    pageBuilderDocumentStore.saveEmailDocument(resourceId, async (document) => {
      emailEditor.value.content = document.content;
      emailEditor.value.root = document.root;
      await saveContent();
    });
  const saveDatasetReference = async (newDatasetReference: DatasetReference | undefined) => {
    emailEditor.value.datasetReference = newDatasetReference;
    await saveContent();
  };
  return { datasetReference, loadContent, saveDatasetReference, saveEmail };
});
