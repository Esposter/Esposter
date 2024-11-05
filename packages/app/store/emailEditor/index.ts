import type { ProjectData } from "grapesjs";

import { EmailEditor } from "@/models/emailEditor/EmailEditor";
import { saveItemMetadata } from "@/services/shared/saveItemMetadata";

export const useEmailEditorStore = defineStore("emailEditor", () => {
  const { $client } = useNuxtApp();
  const readEmailEditor = () => $client.emailEditor.readEmailEditor.query();
  const saveEmailEditor = async (projectData: ProjectData) => {
    const emailEditor = Object.assign(new EmailEditor(), projectData);
    saveItemMetadata(emailEditor);
    await $client.emailEditor.saveEmailEditor.mutate(emailEditor);
  };
  return { readEmailEditor, saveEmailEditor };
});
