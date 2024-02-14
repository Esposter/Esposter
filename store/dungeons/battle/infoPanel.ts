export const useInfoPanelStore = defineStore("dungeons/battle/infoPanel", () => {
  const line1Text = ref("");
  const line1TextDisplayWidth = ref<number>();
  const line2Text = ref("");
  return {
    line1Text,
    line1TextDisplayWidth,
    line2Text,
  };
});
