// A finger that has rested long enough to start a drag holds the page still while the drag is held, so the browser's scroll
// Does not take the touch back and cancel the drag. Only a cancelable touch move can be held, which one after the rest is.
// Returns the stop of the hold
export const holdPageStillWhile = (checkIsDragging: () => boolean) =>
  useEventListener(
    "touchmove",
    (touchEvent) => {
      if (checkIsDragging()) touchEvent.preventDefault();
    },
    { passive: false },
  );
