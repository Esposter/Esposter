import { ClickPopupProps } from "@/components/Clicker/Model/ClickPopup.vue";
import { useCursorStore } from "@/store/clicker/useCursorStore";
import { usePointStore } from "@/store/clicker/usePointStore";
import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";

export const usePopupStore = defineStore("clicker/popup", () => {
  const cursorStore = useCursorStore();
  const { incrementPoints } = usePointStore();
  const popups = ref<({ id: string } & ClickPopupProps)[]>([]);
  const onClick = ({ pageX, pageY }: MouseEvent) => {
    const id = uuidv4();
    const duration = 10000;
    incrementPoints(cursorStore.cursorPower);
    popups.value.push({ id, points: cursorStore.cursorPower, top: pageY, left: pageX, duration });
    setTimeout(() => {
      const index = popups.value.findIndex((p) => p.id === id);
      if (index > -1) popups.value.splice(index, 1);
    }, duration);
  };

  return { popups, onClick };
});
