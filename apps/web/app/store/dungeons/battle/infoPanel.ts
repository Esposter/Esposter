export const useBattleInfoPanelStore = defineStore("dungeons/battle/infoPanel", () => {
  const { dialogMessage: line1DialogMessage, textDisplayWidth: line1TextDisplayWidth } = useDialogMessage();
  const line2Text = ref("");
  return { line1DialogMessage, line1TextDisplayWidth, line2Text };
});
