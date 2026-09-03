export const useBattleInfoPanelStore = defineStore("dungeons/battle/infoPanel", () => {
  const line2Text = ref("");
  return {
    ...useDialogMessage("line1"),
    line2Text,
  };
});
