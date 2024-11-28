export const useInfoPanelStore = defineStore("dungeons/inventory/infoPanel", () => {
  const { infoDialogMessage } = useDialogMessage("info");
  return {
    infoDialogMessage,
  };
});
