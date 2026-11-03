import { ScreenKind } from "#src/models/screen/ScreenKind";
import { defineStore } from "pinia";
import { ref } from "vue";

// The screen the world is on, the world's own until one is opened over it, and the close every screen takes back to the
// World. A screen is a thing no feature owns and many read, so it is the session's, and it is the world's again when the
// Session ends
export const useWorldScreenStore = defineStore("world/screen", () => {
  const screenKind = ref(ScreenKind.World);
  const closeScreen = () => {
    screenKind.value = ScreenKind.World;
  };
  return { closeScreen, screenKind };
});
