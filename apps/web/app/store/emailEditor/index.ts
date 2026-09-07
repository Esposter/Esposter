import type { DatasetReference } from "#shared/models/dataset/DatasetReference";
import type { ResourceType } from "@esposter/db-schema";
import type { Editor, ProjectData } from "grapesjs";

import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { getEmailHtml } from "@/services/emailEditor/getEmailHtml";
import { getItemMetadata } from "@/services/entity/getItemMetadata";
import { useResourceStore } from "@/store/resource";
import { getResult } from "@esposter/shared";

export const useEmailEditorStore = defineStore("emailEditor", () => {
  const resourceStore = useResourceStore();
  const { readContent, readResource, saveContent, setPersistedContent } = resourceStore;
  // Cast avoids the excessively deep UnwrapRef instantiation on the nested GrapesJS project types
  const content = ref(new EmailEditor()) as Ref<EmailEditor>;
  // The live GrapesJS editor, set by the blade — the export command (command bar) reads it from here
  const editor = shallowRef<Editor>();
  const datasetReference = computed(() => content.value.datasetReference);
  const readEmailEditor = async () => {
    await readResource();
    const data = await readContent<ResourceType.Email>();
    content.value = new EmailEditor(data);
    setPersistedContent(content.value);
    return content.value;
  };
  // GrapesJS project data doesn't know about the dataset binding or the loaded content's own metadata, so
  // Saves carry both over; the compiled MJML is captured alongside them because only the client editor can
  // Compile it for the published web view. A failed compile must not drop the save, so the last captured
  // Html rides along instead
  const saveEmailEditor = (projectData: ProjectData, editorInstance: Editor) => {
    const html = getResult(() => getEmailHtml(editorInstance)).match(
      (newHtml) => newHtml,
      () => content.value.html,
    );
    content.value = new EmailEditor({
      ...projectData,
      ...getItemMetadata(content.value),
      datasetReference: datasetReference.value,
      html,
    });
    return saveContent(content.value);
  };
  const saveDatasetReference = async (newDatasetReference: DatasetReference | undefined) => {
    const emailEditor = new EmailEditor(content.value);
    emailEditor.datasetReference = newDatasetReference;
    content.value = emailEditor;
    await saveContent(content.value);
  };
  return { datasetReference, editor, readEmailEditor, saveDatasetReference, saveEmailEditor };
});
