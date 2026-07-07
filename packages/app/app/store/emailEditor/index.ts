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
    createResource,
    currentResource,
    deleteResource,
    load,
    loadLocal,
    renameResource,
    resources,
    save,
    selectResource,
  } = useResourceState(
    EmailEditor,
    {
      createResource: (input) => $trpc.emailEditor.createResource.mutate(input),
      deleteResource: (input) => $trpc.emailEditor.deleteResource.mutate(input),
      readResourceContent: (input) => $trpc.emailEditor.readResourceContent.query(input),
      readResources: async () => (await $trpc.emailEditor.readResources.query()).items,
      saveResourceContent: (input) => $trpc.emailEditor.saveResourceContent.mutate(input),
      updateResource: (input) => $trpc.emailEditor.updateResource.mutate(input),
    },
    { defaultName: "My Email", localStorageKey: EMAIL_EDITOR_LOCAL_STORAGE_KEY, schema: emailEditorSchema },
  );
  const datasetReference = computed(() => content.value.datasetReference);
  // The resource list load happens once; subsequent editor storage loads serve the selected resource's content
  const readEmailEditor = async () => {
    if (session.value.data) {
      if (!currentResource.value) await load();
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
    createResource,
    currentResource,
    datasetReference,
    deleteResource,
    readEmailEditor,
    renameResource,
    resources,
    saveDatasetReference,
    saveEmailEditor,
    selectResource,
  };
});
