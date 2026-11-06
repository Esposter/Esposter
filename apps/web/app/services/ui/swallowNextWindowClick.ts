import { swallowClick } from "@/services/ui/swallowClick";

// A release can land on the control a press began on, and the browser clicks that control. The click that follows a drag is
// Stopped before it reaches the control, and only that one: a press or a key starts something whose click is its own, and a
// Touch drag raises none at all. Returns the stop of the swallow, for a drag that ends it sooner
export const swallowNextWindowClick = () => {
  const stops: (() => void)[] = [];
  const stop = () => {
    for (const stopListener of stops) stopListener();
  };
  stops.push(
    useEventListener(
      "click",
      (event) => {
        swallowClick(event);
        stop();
      },
      { capture: true },
    ),
    useEventListener("keydown", stop, { capture: true }),
    useEventListener("pointerdown", stop, { capture: true }),
  );

  return stop;
};
