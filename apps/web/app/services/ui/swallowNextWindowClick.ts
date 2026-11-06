import { swallowClick } from "@/services/ui/swallowClick";

// A release can land on the control a press began on, and the browser clicks that control. The click that follows a drag is
// Stopped before it reaches the control, and the stop is dropped once the release's click has been dispatched
export const swallowNextWindowClick = () => {
  const stop = useEventListener("click", swallowClick, { capture: true, once: true });
  setTimeout(stop, 0);
};
