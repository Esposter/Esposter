import { type PointsPopupProps } from "@/components/Clicker/Model/Points/Popup.vue";
import { useMouseStore } from "@/store/clicker/mouse";
import { usePointStore } from "@/store/clicker/point";

export const usePopupStore = defineStore("clicker/popup", () => {
  const mouseStore = useMouseStore();
  const { mousePower } = storeToRefs(mouseStore);
  const pointStore = usePointStore();
  const { incrementPoints } = pointStore;

  const popups = ref<({ id: string } & PointsPopupProps)[]>([]);
  const onClick = ({ pageX, pageY }: MouseEvent) => {
    const id = crypto.randomUUID();
    const duration = 10000;
    incrementPoints(mousePower.value);
    popups.value.push({ id, points: mousePower.value, top: pageY, left: pageX, duration });
    window.setTimeout(() => {
      const index = popups.value.findIndex((p) => p.id === id);
      if (index > -1) popups.value.splice(index, 1);
    }, duration);
  };

  return { popups, onClick };
});
