import { RightDrawer } from "@/services/message/RightDrawer";

export const useLayoutStore = defineStore("message/layout", () => {
  const rightDrawer = ref(RightDrawer.Member);
  return {
    rightDrawer,
  };
});
