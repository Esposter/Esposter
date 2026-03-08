import { Clicker, clickerSchema } from "#shared/models/clicker/data/Clicker";
import { authClient } from "@/services/auth/authClient";
import { CLICKER_LOCAL_STORAGE_KEY } from "@/services/clicker/constants";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";

export const useClickerStore = defineStore("clicker", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const saveToLocalStorage = useSaveToLocalStorage();
  const clicker = ref(new Clicker());
  const saveClicker = async () => {
    saveItemMetadata(clicker.value);
    if (session.value.data) await $trpc.clicker.saveClicker.mutate(clicker.value);
    else saveToLocalStorage(CLICKER_LOCAL_STORAGE_KEY, clickerSchema, clicker.value);
  };
  return { clicker, saveClicker };
});
