import { MessageDisplayMode } from "@/models/message/MessageDisplayMode";

export const useAppearanceStore = defineStore("message/ui/appearance", () => {
  // Message display density is device-visual state, so it persists per device like the theme cookie
  const messageDisplayMode = useLocalStorage("message-display-mode", MessageDisplayMode.Cozy);
  return { messageDisplayMode };
});
