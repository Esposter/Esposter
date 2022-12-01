import { defineStore } from "pinia";

export const useCursorStore = defineStore("clicker/cursor", () => {
  const baseCursorPower = ref(1);
  const cursorPower = computed(() => baseCursorPower.value);
  return { cursorPower };
});
