import type { EmailEditor } from "@/models/emailEditor/EmailEditor";

import { saveItemMetadata } from "@/services/shared/saveItemMetadata";

export const useEmailEditorStore = defineStore("emailEditor", () => {
  const { $client } = useNuxtApp();
  const readEmailEditor = () => $client.emailEditor.readEmailEditor.query();
  const saveEmailEditor = async (emailEditor: EmailEditor) => {
    saveItemMetadata(emailEditor);
    await $client.emailEditor.saveEmailEditor.mutate(emailEditor);
  };
  return { readEmailEditor, saveEmailEditor };
});
