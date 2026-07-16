import { MessageDisplayMode } from "@/models/message/MessageDisplayMode";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

export const useAppearanceStore = defineStore("message/ui/appearance", () => {
  // Message display density is device-visual state, so it persists per device like the theme cookie
  const messageDisplayMode = useLocalStorage(LocalStorageKey.MessageDisplayMode, MessageDisplayMode.Cozy);
  return { messageDisplayMode };
});
