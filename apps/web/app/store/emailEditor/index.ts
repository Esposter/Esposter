import type { DatasetReference } from "#shared/models/dataset/DatasetReference";
import type { Editor, ProjectData } from "grapesjs";

import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { getEmailHtml } from "@/services/emailEditor/getEmailHtml";
import { getItemMetadata } from "@/services/entity/getItemMetadata";
import { createContentData } from "@/services/resource/createContentData";
import { useAlertStore } from "@/store/alert";
import { ResourceType } from "@esposter/db-schema";
import { getResult } from "@esposter/shared";

export const useEmailEditorStore = defineStore("emailEditor", () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const { content, loadContent, saveContent } = createContentData(ResourceType.Email, (data) => new EmailEditor(data));
  // The live GrapesJS editor, set by the blade — the export command (command bar) reads it from here
  const editor = shallowRef<Editor>();
  const datasetReference = computed(() => content.value.datasetReference);
  // The editor is rebuilt on every mount of its blade and on a restore, and loads from here each time
  const readEmailEditor = async () => {
    await loadContent();
    return content.value;
  };
  // GrapesJS project data doesn't know about the dataset binding or the loaded content's own metadata, so
  // Saves carry both over; the compiled MJML is captured alongside them because only the client editor can
  // Compile it for the published web view. A failed compile must not drop the save, so the last captured
  // Html rides along instead, and the author is told the published view now lags the project
  const saveEmailEditor = (projectData: ProjectData, editorInstance: Editor) => {
    const html = getResult(() => getEmailHtml(editorInstance))
      .orTee((error) => {
        console.error(error);
        createAlert("The email failed to compile, so its published view keeps the last version that did", "warning");
      })
      .unwrapOr(content.value.html);
    content.value = new EmailEditor({
      ...projectData,
      ...getItemMetadata(content.value),
      datasetReference: datasetReference.value,
      html,
    });
    return saveContent();
  };
  const saveDatasetReference = async (newDatasetReference: DatasetReference | undefined) => {
    const emailEditor = new EmailEditor(content.value);
    emailEditor.datasetReference = newDatasetReference;
    content.value = emailEditor;
    await saveContent();
  };
  return { datasetReference, editor, readEmailEditor, saveDatasetReference, saveEmailEditor };
});
