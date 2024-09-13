import type { Types } from "phaser";

export const useTextStore = defineStore("phaser/text", () => {
  const defaultTextStyle = ref<Types.GameObjects.Text.TextStyle>();
  return {
    defaultTextStyle,
  };
});
