import { DEFAULT_POSITION } from "@/services/toast/constants";

export const useToastStore = defineStore("toast", () => {
  const position = ref(DEFAULT_POSITION);
  return {
    position,
  };
});
