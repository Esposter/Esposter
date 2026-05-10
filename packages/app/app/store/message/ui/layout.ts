import { RightDrawer } from "@/models/message/RightDrawer";

export const useLayoutStore = defineStore("message/ui/layout", () => {
  const rightDrawer = ref(RightDrawer.Member);
  return {
    rightDrawer,
  };
});
