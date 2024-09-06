export const useInfoPanelStore = defineStore("dungeons/monsterParty/infoPanel", () => {
  const { infoDialogMessage } = useDialogMessage("info");
  return {
    infoDialogMessage,
  };
});
