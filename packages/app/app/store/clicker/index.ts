import { Clicker, clickerSchema } from "#shared/models/clicker/data/Clicker";
import { CLICKER_LOCAL_STORAGE_KEY } from "@/services/clicker/constants";

export const useClickerStore = defineStore("clicker", () => {
  const { $trpc } = useNuxtApp();
  const clicker = ref(new Clicker());
  const saveClicker = useSave(clicker, {
    auth: { save: $trpc.clicker.saveClicker.mutate },
    unauth: { key: CLICKER_LOCAL_STORAGE_KEY, schema: clickerSchema },
  });
  return { clicker, saveClicker };
});
