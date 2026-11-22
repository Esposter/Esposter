import type { Popup } from "#src/models/clicker/Popup";

import { POPUP_DURATION_MS } from "#src/services/clicker/constants";
import { useMouseStore } from "#src/store/clicker/mouse";
import { usePointStore } from "#src/store/clicker/point";
import { v7 } from "uuid";

export const usePopupStore = defineStore("clicker/popup", () => {
  const mouseStore = useMouseStore();
  const pointStore = usePointStore();
  const { incrementPoints } = pointStore;
  const popups = ref<Popup[]>([]);
  const createPopup = (event: MouseEvent) => {
    const id = v7();
    incrementPoints(mouseStore.mousePower);
    popups.value.push({
      durationMs: POPUP_DURATION_MS,
      id,
      left: event.pageX,
      points: mouseStore.mousePower,
      top: event.pageY,
    });
    window.setTimeout(() => {
      popups.value = popups.value.filter((popup) => popup.id !== id);
    }, POPUP_DURATION_MS);
  };
  return { createPopup, popups };
});
