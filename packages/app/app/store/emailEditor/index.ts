import type { ProjectData } from "grapesjs";

import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";

export const useEmailEditorStore = defineStore("emailEditor", () => {
  const { $trpc } = useNuxtApp();
  const emailEditor = ref(new EmailEditor());
  const save = useSave(emailEditor, { auth: { save: $trpc.emailEditor.saveEmailEditor.mutate } });
  const readEmailEditor = () => $trpc.emailEditor.readEmailEditor.query();
  const saveEmailEditor = async (projectData: ProjectData) => {
    emailEditor.value = new EmailEditor(projectData);
    await save();
  };
  return { readEmailEditor, saveEmailEditor };
});
