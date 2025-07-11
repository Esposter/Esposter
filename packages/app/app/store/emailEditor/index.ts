import type { ProjectData } from "grapesjs";

import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";

export const useEmailEditorStore = defineStore("emailEditor", () => {
  const { $trpc } = useNuxtApp();
  const readEmailEditor = () => $trpc.emailEditor.readEmailEditor.query();
  const saveEmailEditor = async (projectData: ProjectData) => {
    const emailEditor = new EmailEditor(projectData);
    saveItemMetadata(emailEditor);
    await $trpc.emailEditor.saveEmailEditor.mutate(emailEditor);
  };
  return { readEmailEditor, saveEmailEditor };
});
