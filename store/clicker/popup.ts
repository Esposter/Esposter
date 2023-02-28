import type { PointsPopupProps } from "@/components/Clicker/Model/Points/Popup.vue";
import { useMouseStore } from "@/store/clicker/mouse";
import { usePointStore } from "@/store/clicker/point";
import { v4 as uuidv4 } from "uuid";

export const usePopupStore = defineStore("clicker/popup", () => {
  const mouseStore = useMouseStore();
  const { mousePower } = $(storeToRefs(mouseStore));
  const pointStore = usePointStore();
  const { incrementPoints } = pointStore;

  const popups = ref<({ id: string } & PointsPopupProps)[]>([]);
  const onClick = ({ pageX, pageY }: MouseEvent) => {
    const id = uuidv4();
    const duration = 10000;
    incrementPoints(mousePower);
    popups.value.push({ id, points: mousePower, top: pageY, left: pageX, duration });
    setTimeout(() => {
      const index = popups.value.findIndex((p) => p.id === id);
      if (index > -1) popups.value.splice(index, 1);
    }, duration);
  };

  return { popups, onClick };
});
