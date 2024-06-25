import { EmailEditor } from "@/models/emailEditor/EmailEditor";
import { EMAIL_EDITOR_LOCAL_STORAGE_KEY } from "@/services/emailEditor/constants";
import { saveItemMetadata } from "@/services/shared/saveItemMetadata";

export const useEmailEditorStore = defineStore("emailEditor", () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const emailEditor = ref(new EmailEditor());
  const saveEmailEditor = async () => {
    if (status.value === "authenticated") {
      saveItemMetadata(emailEditor.value);
      await $client.emailEditor.saveEmailEditor.mutate(emailEditor.value);
    } else if (status.value === "unauthenticated") {
      saveItemMetadata(emailEditor.value);
      localStorage.setItem(EMAIL_EDITOR_LOCAL_STORAGE_KEY, emailEditor.value.toJSON());
    }
  };
  return { emailEditor, saveEmailEditor };
});
