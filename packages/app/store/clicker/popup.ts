import type { PointsPopupProps } from "@/components/Clicker/Model/Points/Popup.vue";

import { dayjs } from "@/shared/services/dayjs";
import { useMouseStore } from "@/store/clicker/mouse";
import { usePointStore } from "@/store/clicker/point";

interface Popup extends PointsPopupProps {
  id: string;
}

export const usePopupStore = defineStore("clicker/popup", () => {
  const mouseStore = useMouseStore();
  const pointStore = usePointStore();
  const { incrementPoints } = pointStore;
  const popups = ref<Popup[]>([]);
  const onClick = ({ pageX, pageY }: MouseEvent) => {
    const id = crypto.randomUUID();
    const duration = dayjs.duration(10, "seconds").asMilliseconds();
    incrementPoints(mouseStore.mousePower);
    popups.value.push({ duration, id, left: pageX, points: mouseStore.mousePower, top: pageY });
    window.setTimeout(() => {
      const index = popups.value.findIndex((p) => p.id === id);
      if (index > -1) popups.value.splice(index, 1);
    }, duration);
  };
  return { onClick, popups };
});
