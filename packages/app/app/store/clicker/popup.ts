import type { Popup } from "@/models/clicker/Popup";

import { useMouseStore } from "@/store/clicker/mouse";
import { usePointStore } from "@/store/clicker/point";

export const usePopupStore = defineStore("clicker/popup", () => {
  const mouseStore = useMouseStore();
  const pointStore = usePointStore();
  const { incrementPoints } = pointStore;
  const popups = ref<Popup[]>([]);
  const duration = Temporal.Duration.from({ seconds: 10 }).total("milliseconds");
  const createPopup = (event: MouseEvent) => {
    const id = crypto.randomUUID();
    incrementPoints(mouseStore.mousePower);
    popups.value.push({ duration, id, left: event.pageX, points: mouseStore.mousePower, top: event.pageY });
    // The id is closed over rather than taken as a parameter: `useTimeoutFn` forwards the arguments its own
    // `start()` is called with, and this one runs on the immediate start it does for itself — so a parameter
    // Arrives undefined, matches no popup, and every popup stays in the array behind its finished animation
    useTimeoutFn(() => {
      popups.value = popups.value.filter((popup) => popup.id !== id);
    }, duration);
  };
  return { createPopup, popups };
});
