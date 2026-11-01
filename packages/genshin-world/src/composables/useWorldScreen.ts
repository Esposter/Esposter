import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ref } from "vue";

// The screen the world is on, the world's own until one is opened over it, and the close every screen takes back to the world
export const useWorldScreen = () => {
  const screenKind = ref(ScreenKind.World);
  const closeScreen = () => {
    screenKind.value = ScreenKind.World;
  };
  return { closeScreen, screenKind };
};
