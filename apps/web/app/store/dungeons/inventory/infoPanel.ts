export const useInventoryInfoPanelStore = defineStore("dungeons/inventory/infoPanel", () => {
  const { dialogMessage: infoDialogMessage } = useDialogMessage();
  return { infoDialogMessage };
});
