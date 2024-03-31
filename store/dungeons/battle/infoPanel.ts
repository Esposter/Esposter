import { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";

export const useInfoPanelStore = defineStore("dungeons/battle/infoPanel", () => {
  const line1DialogMessage = ref(new DialogMessage());
  const line1TextDisplayWidth = ref<number>();
  const line2Text = ref("");
  return {
    line1DialogMessage,
    line1TextDisplayWidth,
    line2Text,
  };
});
