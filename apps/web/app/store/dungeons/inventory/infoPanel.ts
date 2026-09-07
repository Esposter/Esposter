export const useInventoryInfoPanelStore = defineStore("dungeons/inventory/infoPanel", () => {
  const { infoDialogMessage } = useDialogMessage("info");
  return {
    infoDialogMessage,
  };
});
