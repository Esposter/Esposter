import { Clicker } from "#shared/models/clicker/data/Clicker";
import { authClient } from "@/services/auth/authClient";
import { CLICKER_LOCAL_STORAGE_KEY } from "@/services/clicker/constants";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";

export const useClickerStore = defineStore("clicker", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const clicker = ref(new Clicker());
  const saveClicker = async () => {
    if (session.value.data) {
      saveItemMetadata(clicker.value);
      await $trpc.clicker.saveClicker.mutate(clicker.value);
    } else {
      saveItemMetadata(clicker.value);
      localStorage.setItem(CLICKER_LOCAL_STORAGE_KEY, clicker.value.toJSON());
    }
  };
  return { clicker, saveClicker };
});
