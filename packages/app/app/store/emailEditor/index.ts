import type { DatasetReference } from "#shared/models/dataset/DatasetReference";
import type { Editor, ProjectData } from "grapesjs";

import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";

export const useEmailEditorStore = defineStore("emailEditor", () => {
  const route = useRoute();
  const { load, readContent, resource, save } = useResource(() =>
    Array.isArray(route.params.id) ? (route.params.id[0] ?? "") : (route.params.id ?? ""),
  );
  // Cast avoids the excessively deep UnwrapRef instantiation on the nested GrapesJS project types
  const content = ref(new EmailEditor()) as Ref<EmailEditor>;
  // The live GrapesJS editor, set by the blade — the export command (command bar) reads it from here
  const editor = shallowRef<Editor>();
  const datasetReference = computed(() => content.value.datasetReference);
  // GrapesJS storage adapter load: serve the selected resource's content
  const readEmailEditor = async () => {
    await load();
    const data = await readContent();
    content.value = new EmailEditor(data ?? undefined);
    return content.value;
  };
  // GrapesJS project data doesn't know about the dataset binding, so saves carry it over; the compiled
  // MJML is captured alongside it because only the client editor can compile it for the published web view
  const saveEmailEditor = async (projectData: ProjectData, { html }: Pick<EmailEditor, "html">) => {
    content.value = new EmailEditor({ ...projectData, datasetReference: datasetReference.value, html });
    await save(content.value);
  };
  const saveDatasetReference = async (newDatasetReference: DatasetReference | undefined) => {
    const emailEditor = new EmailEditor(content.value);
    emailEditor.datasetReference = newDatasetReference;
    content.value = emailEditor;
    await save(content.value);
  };
  return { content, datasetReference, editor, readEmailEditor, resource, saveDatasetReference, saveEmailEditor };
});
