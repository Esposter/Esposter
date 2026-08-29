import type { Popup } from "@/models/clicker/Popup";

import { useMouseStore } from "@/store/clicker/mouse";
import { usePointStore } from "@/store/clicker/point";
import { SECOND } from "@esposter/shared";

export const usePopupStore = defineStore("clicker/popup", () => {
  const mouseStore = useMouseStore();
  const pointStore = usePointStore();
  const { incrementPoints } = pointStore;
  const popups = ref<Popup[]>([]);
  const duration = 10 * SECOND;
  const onClick = (event: MouseEvent) => {
    const id = crypto.randomUUID();
    incrementPoints(mouseStore.mousePower);
    popups.value.push({ duration, id, left: event.pageX, points: mouseStore.mousePower, top: event.pageY });
    useTimeoutFn((popupId: string) => {
      const index = popups.value.findIndex((p) => p.id === popupId);
      if (index === -1) return;
      popups.value = popups.value.toSpliced(index, 1);
    }, duration);
  };
  return { onClick, popups };
});
